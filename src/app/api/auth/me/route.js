import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    // Fetch user details from the database
    const userResult = await query(
      'SELECT id, username, email, xp, level, current_streak, longest_streak, last_journal_date FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Fetch achievements
    const achievementsResult = await query(
      'SELECT badge_key, unlocked_at FROM achievements WHERE user_id = $1',
      [userId]
    );

    return Response.json({
      user: {
        ...user,
        achievements: achievementsResult.rows
      }
    });

  } catch (err) {
    console.error('Fetch user error:', err);
    return Response.json({ message: 'Server error fetching user details' }, { status: 500 });
  }
}
