import { Pool } from 'pg';

let pool;

if (!global._postgresPool) {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    console.log('Initializing standard PostgreSQL Pool with connection string.');
    global._postgresPool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        ? false 
        : { rejectUnauthorized: false }
    });
  } else {
    console.warn('DATABASE_URL is not configured. Database queries will fail.');
  }
}
pool = global._postgresPool;

export async function query(text, params) {
  if (!pool) {
    throw new Error('PostgreSQL Connection Pool is not initialized. Please verify DATABASE_URL is set.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  if (!pool) {
    throw new Error('PostgreSQL Connection Pool is not initialized. Please verify DATABASE_URL is set.');
  }
  return await pool.connect();
}

// Initialize database schema
async function initDB() {
  if (!pool) return;
  console.log('Initializing PostgreSQL database schema...');
  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_journal_date VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Entries Table
    await query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. AI Insights Table
    await query(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER UNIQUE NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        mood_score INTEGER NOT NULL,
        dominant_emotion VARCHAR(50) NOT NULL,
        feelings_list TEXT NOT NULL, -- Stored as JSON string array
        summary TEXT,
        celebration TEXT,
        improvement TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Friendships Table
    await query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) CHECK(status IN ('pending', 'accepted')) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    // 5. Achievements Table
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_key VARCHAR(50) NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_key)
      )
    `);

    console.log('PostgreSQL database tables successfully verified/created.');
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
  }
}

// Trigger initial DDL schema check on import
if (pool) {
  initDB();
}
