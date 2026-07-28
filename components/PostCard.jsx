"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function PostCard({ post, index = 0, onDeleted }) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [deleting, setDeleting] = useState(false);
  const isOwn = session?.user?.id === post.author.id;

  async function handleDelete() {
    if (!confirm("Remove this post? This can't be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.(post.id);
    } else {
      setDeleting(false);
    }
  }

  function toggleComments() {
    setShowComments((s) => !s);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.97 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-line bg-ink-soft/70 p-5 transition-colors hover:border-line-strong"
    >
      <div className="flex gap-3.5">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar color={post.author.avatarColor} letter={post.author.avatarLetter} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-medium hover:text-gold"
              >
                {post.author.name}
              </Link>
              <span className="ml-1.5 font-mono text-xs text-paper-dim">
                @{post.author.username} · {timeAgo(post.createdAt)}
              </span>
            </div>
            {isOwn && (
              <button
                onClick={handleDelete}
                title="Delete post"
                className="shrink-0 rounded-full p-1 text-paper-dim/60 transition hover:text-coral"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M9 7V4h6v3m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-paper/95">
            {post.content}
          </p>

          <div className="mt-3.5 flex items-center gap-5">
            <LikeButton
              postId={post.id}
              initialLiked={post.liked}
              initialCount={post.likeCount}
            />
            <button
              onClick={toggleComments}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-xs transition ${
                showComments ? "text-teal" : "text-paper-dim hover:text-paper"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {commentCount}
            </button>
          </div>

          <AnimatePresence>
            {showComments && (
              <CommentSectionWrapper
                postId={post.id}
                onCountChange={setCommentCount}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function CommentSectionWrapper({ postId, onCountChange }) {
  const [comments, setComments] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setComments(d.comments);
        onCountChange(d.comments.length);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (comments === null) {
    return (
      <div className="ml-1 mt-3 border-l border-line pl-4 font-mono text-xs text-paper-dim">
        Loading replies…
      </div>
    );
  }

  return (
    <CommentSection
      postId={postId}
      initialComments={comments}
      onCommentAdded={() => onCountChange((c) => (typeof c === "number" ? c + 1 : c))}
    />
  );
}
