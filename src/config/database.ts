import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Lightweight query wrapper used by models
 */
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * Test DB connection - returns true if OK, false if not.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('Postgres connection error:', err);
    return false;
  }
}

/**
 * initializeDatabase - placeholder for any DB init steps
 * Returns true on success.
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    // add any init logic here if needed
    return true;
  } catch (err) {
    console.error('Error initializing database:', err);
    return false;
  }
}

/**
 * initializeSchema - placeholder for running schema/migrations if needed
 * Returns true on success.
 */
export async function initializeSchema(): Promise<boolean> {
  try {
    // add migration logic here if needed
    return true;
  } catch (err) {
    console.error('Error initializing schema:', err);
    return false;
  }
}

export default pool;
