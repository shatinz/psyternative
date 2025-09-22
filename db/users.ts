import { query } from './index';

export async function createUser({ uid, username, email, avatarUrl, hasChangedUsername, bio }: {
  uid: string;
  username: string;
  email: string;
  avatarUrl?: string;
  hasChangedUsername?: boolean;
  bio?: string;
}) {
  return query(
    `INSERT INTO users (uid, username, email, avatar_url, has_changed_username, bio)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (uid) DO NOTHING`,
    [uid, username, email, avatarUrl || null, hasChangedUsername || false, bio || null]
  );
}

export async function getUserByUid(uid: string) {
  const res = await query('SELECT * FROM users WHERE uid = $1', [uid]);
  return res.rows[0];
}

export async function getUserByUsername(username: string) {
  const res = await query('SELECT * FROM users WHERE username = $1', [username]);
  return res.rows[0];
}
