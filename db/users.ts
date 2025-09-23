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

export async function updateUser(uid: string, { username, bio, hasChangedUsername }: {
  username?: string;
  bio?: string;
  hasChangedUsername?: boolean;
}) {
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (username !== undefined) {
    updates.push(`username = $${paramIndex++}`);
    values.push(username);
  }
  if (bio !== undefined) {
    updates.push(`bio = $${paramIndex++}`);
    values.push(bio);
  }
  if (hasChangedUsername !== undefined) {
    updates.push(`has_changed_username = $${paramIndex++}`);
    values.push(hasChangedUsername);
  }

  if (updates.length === 0) return;

  values.push(uid);
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE uid = $${paramIndex}`;
  return query(sql, values);
}

export async function getUserForDisplay(uid: string) {
  const user = await getUserByUid(uid);
  if (!user) return null;
  return {
    id: user.uid,
    name: user.username,
    email: user.email,
    avatarUrl: user.avatar_url || '',
    hasChangedUsername: user.has_changed_username || false,
    bio: user.bio || '',
  };
}
