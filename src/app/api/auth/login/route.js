import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json(); // Can be username or email

    if (!username || !password) {
      return Response.json({ message: 'Please enter all fields' }, { status: 400 });
    }

    // Find user by username or email
    const userResult = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, username]);
    if (userResult.rows.length === 0) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const user = userResult.rows[0];

    // Validate password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Create JWT token
    const token = signToken({ id: user.id, username: user.username });

    return Response.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        last_journal_date: user.last_journal_date
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ message: 'Server error during login' }, { status: 500 });
  }
}
