import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Simple validation
    if (!username || !email || !password) {
      return Response.json({ message: 'Please enter all fields' }, { status: 400 });
    }

    // Check if user exists (by email or username)
    const existing = await query('SELECT id, username, email FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      const matched = existing.rows[0];
      if (matched.username === username) {
        return Response.json({ message: 'Username is already taken' }, { status: 400 });
      }
      return Response.json({ message: 'Email is already registered' }, { status: 400 });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Insert new user
    const insertResult = await query(`
      INSERT INTO users (username, email, password_hash, xp, level, current_streak, longest_streak)
      VALUES ($1, $2, $3, 0, 1, 0, 0)
      RETURNING id
    `, [username, email, password_hash]);

    const userId = insertResult.rows[0].id;

    // Create JWT token
    const token = signToken({ id: userId, username });

    return Response.json({
      token,
      user: {
        id: userId,
        username,
        email,
        xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0
      }
    }, { status: 201 });

  } catch (err) {
    console.error('Registration error:', err);
    return Response.json({ message: 'Server error during registration' }, { status: 500 });
  }
}
