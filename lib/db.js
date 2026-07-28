// lib/db.js
//
// Thrum's data layer. This project uses Node's built-in `node:sqlite`
// module (available in Node 22.5+) so the whole app runs with zero native
// build steps and zero external services — clone it, `npm install`,
// `npm run dev`, done.
//
// This keeps a single DatabaseSync connection alive for the life of the
// server process (cached on `globalThis` so Next.js dev-mode hot reloads
// don't open a fresh connection on every file edit).

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "thrum.db");

function createConnection() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatarColor TEXT NOT NULL,
      avatarLetter TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      authorId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      authorId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (postId, userId)
    );

    CREATE TABLE IF NOT EXISTS follows (
      followerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      followingId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (followerId, followingId)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(postId);
    CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(postId);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(followingId);
  `);

  return db;
}

const globalForDb = globalThis;

export const db = globalForDb.__thrumDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalForDb.__thrumDb = db;

export function newId() {
  return randomUUID();
}
