import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const ALL_BADGES = {
  first_entry: {
    badge_key: 'first_entry',
    title: 'First Steps',
    description: 'Logged your very first journal entry and began your journey of self-reflection.'
  },
  streak_3: {
    badge_key: 'streak_3',
    title: "Three's Company",
    description: 'Logged journal entries for 3 consecutive days.'
  },
  streak_7: {
    badge_key: 'streak_7',
    title: 'Week Warrior',
    description: 'Logged journal entries for 7 consecutive days.'
  },
  mood_master: {
    badge_key: 'mood_master',
    title: 'Emotional Awareness',
    description: 'Had your first journal entry analyzed by AuraQuest\'s AI guide.'
  },
  social_butterfly: {
    badge_key: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Connected with your first friend on AuraQuest.'
  },
  xp_1000: {
    badge_key: 'xp_1000',
    title: 'XP Elite',
    description: 'Accumulated 1,000 XP in your journaling quest.'
  }
};

export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    // Fetch all achievements unlocked by the user
    const unlockedResult = await query(
      'SELECT badge_key, unlocked_at FROM achievements WHERE user_id = $1',
      [userId]
    );

    const unlockedRows = unlockedResult.rows;
    const unlockedKeys = unlockedRows.map(row => row.badge_key);

    const unlocked = [];
    const locked = [];

    // Map each badge into unlocked or locked list
    Object.keys(ALL_BADGES).forEach(key => {
      const badge = ALL_BADGES[key];
      const index = unlockedKeys.indexOf(key);

      if (index !== -1) {
        unlocked.push({
          ...badge,
          unlocked_at: unlockedRows[index].unlocked_at
        });
      } else {
        locked.push(badge);
      }
    });

    return Response.json({ unlocked, locked });
  } catch (err) {
    console.error('Fetch achievements error:', err);
    return Response.json({ message: 'Server error fetching achievements list' }, { status: 500 });
  }
}
