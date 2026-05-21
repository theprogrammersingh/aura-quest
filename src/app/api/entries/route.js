import { getClient, query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { analyzeJournalEntry } from '@/lib/gemini';

// Helper to calculate level based on XP
function calculateLevel(xp) {
  return Math.floor(xp / 500) + 1;
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

// Helper to get yesterday's date string YYYY-MM-DD
function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

// @route   GET api/entries
// @desc    Get all journal entries for the current user
export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    const entriesResult = await query(`
      SELECT e.id, e.content, e.created_at, e.updated_at,
             i.mood_score, i.dominant_emotion, i.feelings_list, i.summary, i.celebration, i.improvement
      FROM entries e
      LEFT JOIN ai_insights i ON e.id = i.entry_id
      WHERE e.user_id = $1
      ORDER BY e.created_at DESC
    `, [userId]);

    const parsedEntries = entriesResult.rows.map(entry => ({
      ...entry,
      feelings_list: entry.feelings_list ? JSON.parse(entry.feelings_list) : []
    }));

    return Response.json(parsedEntries);
  } catch (err) {
    console.error('Fetch entries error:', err);
    return Response.json({ message: 'Server error fetching journal entries' }, { status: 500 });
  }
}

// @route   POST api/entries
// @desc    Create entry, call Gemini, update streaks/XP/achievements (Transaction)
export async function POST(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return Response.json({ message: 'Journal entry content is required' }, { status: 400 });
    }

    // 1. Perform Gemini AI analysis
    const insights = await analyzeJournalEntry(content);
    
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    const newAchievementsUnlocked = [];
    let updatedUser = null;
    let entryId = null;

    // Database transaction with PG Client pool
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 2. Fetch current user data
      const userRes = await client.query(
        'SELECT xp, level, current_streak, longest_streak, last_journal_date FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      if (userRes.rows.length === 0) {
        throw new Error('User not found');
      }
      const user = userRes.rows[0];

      // 3. Insert the new journal entry
      const entryRes = await client.query(`
        INSERT INTO entries (user_id, content, created_at, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [userId, content]);
      
      entryId = entryRes.rows[0].id;

      // 4. Save AI Insights
      await client.query(`
        INSERT INTO ai_insights (entry_id, mood_score, dominant_emotion, feelings_list, summary, celebration, improvement)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        entryId,
        insights.mood_score,
        insights.dominant_emotion,
        JSON.stringify(insights.feelings_list),
        insights.summary,
        insights.celebration,
        insights.improvement
      ]);

      // 5. Update user XP and Streak
      const addedXp = 100;
      const newXp = (user.xp || 0) + addedXp;
      const newLevel = calculateLevel(newXp);
      
      let newStreak = user.current_streak || 0;
      let newLongest = user.longest_streak || 0;

      if (user.last_journal_date === today) {
        console.log('User already journaled today. Streak remains unchanged.');
      } else if (user.last_journal_date === yesterday) {
        newStreak += 1;
        newLongest = Math.max(newLongest, newStreak);
      } else {
        newStreak = 1;
        newLongest = Math.max(newLongest, newStreak);
      }

      // Update User table
      await client.query(`
        UPDATE users 
        SET xp = $1, level = $2, current_streak = $3, longest_streak = $4, last_journal_date = $5
        WHERE id = $6
      `, [newXp, newLevel, newStreak, newLongest, today, userId]);

      // 6. Check for Achievements/Badges
      const achievementsRes = await client.query('SELECT badge_key FROM achievements WHERE user_id = $1', [userId]);
      const userAchievements = achievementsRes.rows.map(a => a.badge_key);

      const unlockBadge = async (badgeKey) => {
        if (!userAchievements.includes(badgeKey)) {
          await client.query(`
            INSERT INTO achievements (user_id, badge_key, unlocked_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
          `, [userId, badgeKey]);
          newAchievementsUnlocked.push(badgeKey);
        }
      };

      // Badge: First Entry
      await unlockBadge('first_entry');

      // Badge: Mood Master (first analyzed entry)
      await unlockBadge('mood_master');

      // Badge: Streak 3
      if (newStreak >= 3) {
        await unlockBadge('streak_3');
      }

      // Badge: Streak 7
      if (newStreak >= 7) {
        await unlockBadge('streak_7');
      }

      // Badge: XP 1000
      if (newXp >= 1000) {
        await unlockBadge('xp_1000');
      }

      // Fetch the updated user profile
      const updatedUserRes = await client.query(
        'SELECT id, username, email, xp, level, current_streak, longest_streak, last_journal_date FROM users WHERE id = $1',
        [userId]
      );
      updatedUser = updatedUserRes.rows[0];

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

    return Response.json({
      message: 'Journal entry saved and analyzed successfully',
      entry: {
        id: entryId,
        content,
        created_at: today,
        updated_at: today
      },
      insights: {
        ...insights,
        entry_id: entryId
      },
      user: updatedUser,
      newAchievementsUnlocked
    }, { status: 201 });

  } catch (err) {
    console.error('Create entry error:', err);
    return Response.json({ message: 'Server error creating and analyzing journal entry' }, { status: 500 });
  }
}
