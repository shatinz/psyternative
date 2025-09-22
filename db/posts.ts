import { query } from './index';

export async function createPost({ postId, title, content, authorUid, sectionSlug }: {
  postId: string;
  title: string;
  content: string;
  authorUid: string;
  sectionSlug: string;
}) {
  return query(
    `INSERT INTO posts (post_id, title, content, author_uid, section_slug)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (post_id) DO NOTHING`,
    [postId, title, content, authorUid, sectionSlug]
  );
}

export async function getPostById(postId: string) {
  const res = await query('SELECT * FROM posts WHERE post_id = $1', [postId]);
  return res.rows[0];
}

export async function getPostsBySection(sectionSlug: string) {
  const res = await query('SELECT * FROM posts WHERE section_slug = $1 ORDER BY created_at DESC', [sectionSlug]);
  return res.rows;
}
