import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

pool.on('connect', () => console.log('✅ Connected to Supabase PostgreSQL'));
pool.on('error', (err) => console.error('❌ Database error:', err));

export const query = (text, params) => pool.query(text, params);
export default pool;