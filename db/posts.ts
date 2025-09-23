import { query } from './index';
import { getUserForDisplay } from './users';

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
  const row = res.rows[0];
  if (!row) return null;
  const replies = await getRepliesForPost(postId);
  const author = await getUserForDisplay(row.author_uid) || { id: row.author_uid, name: '', avatarUrl: '', hasChangedUsername: false, email: null };
  return {
    id: row.post_id,
    title: row.title,
    content: row.content,
    author,
    createdAt: row.created_at.toISOString(),
    replies,
    sectionSlug: row.section_slug,
  };
}

export async function getPostsBySection(sectionSlug: string) {
  const res = await query('SELECT * FROM posts WHERE section_slug = $1 ORDER BY created_at DESC', [sectionSlug]);
  const posts = [];
  for (const row of res.rows) {
    const author = await getUserForDisplay(row.author_uid) || { id: row.author_uid, name: '', avatarUrl: '', hasChangedUsername: false, email: null };
    posts.push({
      id: row.post_id,
      title: row.title,
      content: row.content,
      author,
      createdAt: new Date(row.created_at),
      replies: [], // For sections, we don't need replies
      sectionSlug: row.section_slug,
    });
  }
  return posts;
}

export async function createReply({ replyId, postId, parentReplyId, content, authorUid }: {
  replyId: string;
  postId: string;
  parentReplyId?: string;
  content: string;
  authorUid: string;
}) {
  return query(
    `INSERT INTO replies (reply_id, post_id, parent_reply_id, content, author_uid)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (reply_id) DO NOTHING`,
    [replyId, postId, parentReplyId || null, content, authorUid]
  );
}

async function buildReplyTree(replyRows: any[]): Promise<any[]> {
  const replyMap = new Map();
  const rootReplies: any[] = [];

  // First pass: create all reply objects
  for (const row of replyRows) {
    const author = await getUserForDisplay(row.author_uid) || { id: row.author_uid, name: '', avatarUrl: '', hasChangedUsername: false, email: null };
    const reply = {
      id: row.reply_id,
      content: row.content,
      author,
      createdAt: new Date(row.created_at).toISOString(),
      replies: [],
    };
    replyMap.set(row.reply_id, reply);
  }

  // Second pass: build the tree
  for (const row of replyRows) {
    const reply = replyMap.get(row.reply_id);
    if (row.parent_reply_id) {
      const parent = replyMap.get(row.parent_reply_id);
      if (parent) {
        parent.replies.push(reply);
      }
    } else {
      rootReplies.push(reply);
    }
  }

  return rootReplies;
}

export async function getRepliesForPost(postId: string) {
  const res = await query('SELECT * FROM replies WHERE post_id = $1 ORDER BY created_at ASC', [postId]);
  return buildReplyTree(res.rows);
}
