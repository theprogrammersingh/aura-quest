import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// @route   GET api/friends/leaderboard
// @desc    Get Weekly XP Leaderboard of user and their friends
export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    // Fetch details of current user
    const meRes = await query(
      'SELECT id, username, email, xp, level, current_streak, longest_streak FROM users WHERE id = $1',
      [userId]
    );

    if (meRes.rows.length === 0) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    const me = meRes.rows[0];

    // Fetch details of accepted friends
    const friendsRes = await query(`
      SELECT u.id, u.username, u.email, u.xp, u.level, u.current_streak, u.longest_streak
      FROM friendships f
      JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
      WHERE (f.user_id = $1 OR f.friend_id = $2) AND f.status = 'accepted' AND u.id != $3
    `, [userId, userId, userId]);

    // Merge together
    const leaderboard = [me, ...friendsRes.rows];

    // Sort by XP descending
    leaderboard.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    // Add ranks (1-indexed)
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player
    }));

    return Response.json(rankedLeaderboard);
  } catch (err) {
    console.error('Calculate leaderboard error:', err);
    return Response.json({ message: 'Server error calculating weekly leaderboard' }, { status: 500 });
  }
}
