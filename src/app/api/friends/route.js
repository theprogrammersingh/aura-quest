import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// @route   GET api/friends
// @desc    Get all accepted friends for the current user
export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    // Select users that have an accepted friendship with the current user
    const friendsResult = await query(`
      SELECT u.id, u.username, u.email, u.xp, u.level, u.current_streak, u.longest_streak, u.last_journal_date
      FROM friendships f
      JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
      WHERE (f.user_id = $1 OR f.friend_id = $2) AND f.status = 'accepted' AND u.id != $3
    `, [userId, userId, userId]);

    return Response.json(friendsResult.rows);
  } catch (err) {
    console.error('Fetch friends error:', err);
    return Response.json({ message: 'Server error fetching friends list' }, { status: 500 });
  }
}

// @route   POST api/friends
// @desc    Send a friend request (by friend_username or friend_id)
export async function POST(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { friend_username, friend_id } = await request.json();

    if (!friend_username && !friend_id) {
      return Response.json({ message: 'Please provide friend_username or friend_id' }, { status: 400 });
    }

    let friend = null;
    if (friend_id) {
      const friendRes = await query('SELECT id, username FROM users WHERE id = $1', [friend_id]);
      if (friendRes.rows.length > 0) friend = friendRes.rows[0];
    } else {
      const friendRes = await query('SELECT id, username FROM users WHERE username = $1', [friend_username]);
      if (friendRes.rows.length > 0) friend = friendRes.rows[0];
    }

    if (!friend) {
      return Response.json({ message: 'User not found' }, { status: 444 });
    }

    if (friend.id === userId) {
      return Response.json({ message: 'You cannot friend yourself' }, { status: 400 });
    }

    // Check if friendship relationship already exists
    const existingResult = await query(`
      SELECT id, user_id, friend_id, status FROM friendships 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $3 AND friend_id = $4)
    `, [userId, friend.id, friend.id, userId]);

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === 'accepted') {
        return Response.json({ message: 'You are already friends' }, { status: 400 });
      } else {
        if (existing.user_id === userId) {
          return Response.json({ message: 'Friend request already sent' }, { status: 400 });
        } else {
          return Response.json({ message: 'You have a pending friend request from this user' }, { status: 400 });
        }
      }
    }

    // Create a pending friend request
    await query(`
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
    `, [userId, friend.id]);

    return Response.json({ message: `Friend request sent to ${friend.username}` }, { status: 201 });
  } catch (err) {
    console.error('Send friend request error:', err);
    return Response.json({ message: 'Server error sending friend request' }, { status: 500 });
  }
}
