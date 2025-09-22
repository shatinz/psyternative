-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(64) UNIQUE NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    avatar_url TEXT,
    has_changed_username BOOLEAN DEFAULT FALSE,
    bio TEXT
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(64) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_uid VARCHAR(64) NOT NULL REFERENCES users(uid),
    created_at TIMESTAMP DEFAULT NOW(),
    section_slug VARCHAR(64) NOT NULL
);
