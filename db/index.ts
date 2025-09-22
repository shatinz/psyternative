import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
});

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
