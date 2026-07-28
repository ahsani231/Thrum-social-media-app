// lib/data.js
//
// All the SQL for Thrum lives here so route handlers stay thin and readable.

import { db, newId } from "./db";

const AVATAR_PALETTE = ["#D8A34B", "#C1603F", "#3C7568", "#8B6FB0", "#4C7FA6"];

function pickAvatar(seed) {
  const idx = seed.charCodeAt(0) % AVATAR_PALETTE.length;
  return {
    avatarColor: AVATAR_PALETTE[idx],
    avatarLetter: seed[0].toUpperCase(),
  };
}

/* ---------------------------- USERS ---------------------------- */

export function getUserByEmail(email) {
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase());
}

export function getUserByUsername(username) {
  return db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username.toLowerCase());
}

export function getUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function createUser({ username, email, name, password }) {
  const id = newId();
  const { avatarColor, avatarLetter } = pickAvatar(name || username);
  db.prepare(
    `INSERT INTO users (id, username, email, password, name, bio, avatarColor, avatarLetter, createdAt)
     VALUES (?, ?, ?, ?, ?, '', ?, ?, ?)`
  ).run(
    id,
    username.toLowerCase(),
    email.toLowerCase(),
    password,
    name,
    avatarColor,
    avatarLetter,
    new Date().toISOString()
  );
  return getUserById(id);
}

export function publicUser(user, viewerId) {
  if (!user) return null;
  const followerCount = db
    .prepare("SELECT COUNT(*) c FROM follows WHERE followingId = ?")
    .get(user.id).c;
  const followingCount = db
    .prepare("SELECT COUNT(*) c FROM follows WHERE followerId = ?")
    .get(user.id).c;
  const postCount = db
    .prepare("SELECT COUNT(*) c FROM posts WHERE authorId = ?")
    .get(user.id).c;
  const isFollowing = viewerId
    ? !!db
        .prepare(
          "SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?"
        )
        .get(viewerId, user.id)
    : false;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatarColor: user.avatarColor,
    avatarLetter: user.avatarLetter,
    createdAt: user.createdAt,
    followerCount,
    followingCount,
    postCount,
    isFollowing,
    isSelf: viewerId === user.id,
  };
}

export function updateBio(userId, bio) {
  db.prepare("UPDATE users SET bio = ? WHERE id = ?").run(bio, userId);
}

/* ---------------------------- FOLLOWS ---------------------------- */

export function toggleFollow(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error("You can't follow yourself.");
  }
  const existing = db
    .prepare(
      "SELECT 1 FROM follows WHERE followerId = ? AND followingId = ?"
    )
    .get(followerId, followingId);

  if (existing) {
    db.prepare(
      "DELETE FROM follows WHERE followerId = ? AND followingId = ?"
    ).run(followerId, followingId);
    return { following: false };
  }
  db.prepare(
    "INSERT INTO follows (followerId, followingId, createdAt) VALUES (?, ?, ?)"
  ).run(followerId, followingId, new Date().toISOString());
  return { following: true };
}

/* ---------------------------- POSTS ---------------------------- */

function decoratePost(row, viewerId) {
  const likeCount = db
    .prepare("SELECT COUNT(*) c FROM likes WHERE postId = ?")
    .get(row.id).c;
  const commentCount = db
    .prepare("SELECT COUNT(*) c FROM comments WHERE postId = ?")
    .get(row.id).c;
  const liked = viewerId
    ? !!db
        .prepare("SELECT 1 FROM likes WHERE postId = ? AND userId = ?")
        .get(row.id, viewerId)
    : false;

  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    likeCount,
    commentCount,
    liked,
    author: {
      id: row.authorId,
      username: row.username,
      name: row.name,
      avatarColor: row.avatarColor,
      avatarLetter: row.avatarLetter,
    },
  };
}

const POST_SELECT = `
  SELECT posts.*, users.username, users.name, users.avatarColor, users.avatarLetter
  FROM posts JOIN users ON users.id = posts.authorId
`;

export function createPost(authorId, content) {
  const id = newId();
  db.prepare(
    "INSERT INTO posts (id, authorId, content, createdAt) VALUES (?, ?, ?, ?)"
  ).run(id, authorId, content, new Date().toISOString());
  const row = db.prepare(`${POST_SELECT} WHERE posts.id = ?`).get(id);
  return decoratePost(row, authorId);
}

export function getFeed(viewerId, { scope = "all" } = {}) {
  let rows;
  if (scope === "following" && viewerId) {
    rows = db
      .prepare(
        `${POST_SELECT}
         WHERE posts.authorId IN (
           SELECT followingId FROM follows WHERE followerId = ?
         ) OR posts.authorId = ?
         ORDER BY posts.createdAt DESC`
      )
      .all(viewerId, viewerId);
  } else {
    rows = db
      .prepare(`${POST_SELECT} ORDER BY posts.createdAt DESC`)
      .all();
  }
  return rows.map((r) => decoratePost(r, viewerId));
}

export function getUserPosts(authorId, viewerId) {
  const rows = db
    .prepare(`${POST_SELECT} WHERE posts.authorId = ? ORDER BY posts.createdAt DESC`)
    .all(authorId);
  return rows.map((r) => decoratePost(r, viewerId));
}

export function getPostById(postId, viewerId) {
  const row = db.prepare(`${POST_SELECT} WHERE posts.id = ?`).get(postId);
  return row ? decoratePost(row, viewerId) : null;
}

export function deletePost(postId, requesterId) {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
  if (!post) throw new Error("Post not found.");
  if (post.authorId !== requesterId) throw new Error("Not your post.");
  db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
}

/* ---------------------------- LIKES ---------------------------- */

export function toggleLike(postId, userId) {
  const existing = db
    .prepare("SELECT 1 FROM likes WHERE postId = ? AND userId = ?")
    .get(postId, userId);

  if (existing) {
    db.prepare("DELETE FROM likes WHERE postId = ? AND userId = ?").run(
      postId,
      userId
    );
  } else {
    db.prepare(
      "INSERT INTO likes (postId, userId, createdAt) VALUES (?, ?, ?)"
    ).run(postId, userId, new Date().toISOString());
  }
  const likeCount = db
    .prepare("SELECT COUNT(*) c FROM likes WHERE postId = ?")
    .get(postId).c;
  return { liked: !existing, likeCount };
}

/* ---------------------------- COMMENTS ---------------------------- */

export function getComments(postId) {
  const rows = db
    .prepare(
      `SELECT comments.*, users.username, users.name, users.avatarColor, users.avatarLetter
       FROM comments JOIN users ON users.id = comments.authorId
       WHERE postId = ? ORDER BY comments.createdAt ASC`
    )
    .all(postId);

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt,
    author: {
      id: r.authorId,
      username: r.username,
      name: r.name,
      avatarColor: r.avatarColor,
      avatarLetter: r.avatarLetter,
    },
  }));
}

export function addComment(postId, authorId, content) {
  const id = newId();
  db.prepare(
    "INSERT INTO comments (id, postId, authorId, content, createdAt) VALUES (?, ?, ?, ?, ?)"
  ).run(id, postId, authorId, content, new Date().toISOString());
  const row = db
    .prepare(
      `SELECT comments.*, users.username, users.name, users.avatarColor, users.avatarLetter
       FROM comments JOIN users ON users.id = comments.authorId
       WHERE comments.id = ?`
    )
    .get(id);
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      username: row.username,
      name: row.name,
      avatarColor: row.avatarColor,
      avatarLetter: row.avatarLetter,
    },
  };
}

export function suggestedUsers(viewerId, limit = 5) {
  const rows = db
    .prepare(
      `SELECT * FROM users
       WHERE id != ?
       AND id NOT IN (SELECT followingId FROM follows WHERE followerId = ?)
       ORDER BY createdAt DESC LIMIT ?`
    )
    .all(viewerId ?? "", viewerId ?? "", limit);
  return rows.map((u) => publicUser(u, viewerId));
}
