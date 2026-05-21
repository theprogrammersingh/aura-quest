import { getClient, query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Helper to check and unlock achievements/badges inside a transaction client
async function checkAndUnlockFriendBadge(userId, client) {
  try {
    const hasBadgeRes = await client.query(
      'SELECT 1 FROM achievements WHERE user_id = $1 AND badge_key = $2',
      [userId, 'social_butterfly']
    );

    if (hasBadgeRes.rows.length === 0) {
      await client.query(`
        INSERT INTO achievements (user_id, badge_key, unlocked_at)
        VALUES ($1, 'social_butterfly', CURRENT_TIMESTAMP)
      `, [userId]);
      console.log(`Unlocked 'social_butterfly' achievement for user ID ${userId}`);
      return true;
    }
  } catch (error) {
    console.error('Error unlocking friend achievement:', error);
  }
  return false;
}

// @route   GET api/friends/requests
// @desc    Get all pending friend requests (received and sent)
export async function GET(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;

    // Received pending requests
    const receivedRes = await query(`
      SELECT f.id as request_id, u.id as user_id, u.username, u.email, u.xp, u.level, u.current_streak
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'pending'
    `, [userId]);

    // Sent pending requests
    const sentRes = await query(`
      SELECT f.id as request_id, u.id as user_id, u.username, u.email, u.xp, u.level, u.current_streak
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = $1 AND f.status = 'pending'
    `, [userId]);

    return Response.json({
      received: receivedRes.rows,
      sent: sentRes.rows
    });
  } catch (err) {
    console.error('Fetch requests error:', err);
    return Response.json({ message: 'Server error fetching pending requests' }, { status: 500 });
  }
}

// @route   PUT api/friends/requests
// @desc    Accept or decline a friend request (Transaction)
export async function PUT(request) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { friend_id, action } = await request.json(); // action: 'accept' or 'decline'

    if (!friend_id || !action) {
      return Response.json({ message: 'friend_id and action (accept/decline) are required' }, { status: 400 });
    }

    // Find the pending request (friend_id must be the sender, userId is receiver)
    const requestResult = await query(`
      SELECT id FROM friendships 
      WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
    `, [friend_id, userId]);

    if (requestResult.rows.length === 0) {
      return Response.json({ message: 'No pending friend request found from this user' }, { status: 444 });
    }

    const requestId = requestResult.rows[0].id;

    if (action === 'accept') {
      const client = await getClient();
      let myAchievementUnlocked = false;

      try {
        await client.query('BEGIN');

        // Update friendship status to accepted
        await client.query(`
          UPDATE friendships 
          SET status = 'accepted' 
          WHERE id = $1
        `, [requestId]);

        // Award achievements for both users
        myAchievementUnlocked = await checkAndUnlockFriendBadge(userId, client);
        await checkAndUnlockFriendBadge(friend_id, client);

        await client.query('COMMIT');
      } catch (txErr) {
        await client.query('ROLLBACK');
        throw txErr;
      } finally {
        client.release();
      }

      return Response.json({ 
        message: 'Friend request accepted',
        unlockedAchievement: myAchievementUnlocked ? 'social_butterfly' : null
      });

    } else if (action === 'decline') {
      await query('DELETE FROM friendships WHERE id = $1', [requestId]);
      return Response.json({ message: 'Friend request declined' });
    } else {
      return Response.json({ message: 'Invalid action. Must be accept or decline.' }, { status: 400 });
    }

  } catch (err) {
    console.error('Accept/decline friend request error:', err);
    return Response.json({ message: 'Server error responding to friend request' }, { status: 500 });
  }
}
