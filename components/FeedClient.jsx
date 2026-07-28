"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";

export default function FeedClient({ initialPosts, user }) {
  const [posts, setPosts] = useState(initialPosts);
  const [scope, setScope] = useState("all");
  const [loading, setLoading] = useState(false);

  function handlePosted(newPost) {
    setPosts((p) => [newPost, ...p]);
  }

  function handleDeleted(id) {
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  async function switchScope(next) {
    if (next === scope) return;
    setScope(next);
    setLoading(true);
    const res = await fetch(`/api/posts?scope=${next}`);
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight">
            {scope === "all" ? "The whole thread" : "Your circle"}
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            {scope === "all"
              ? "Everything everyone on Thrum is stitching together."
              : "Posts from people you follow, plus your own."}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-full border border-line-strong p-1">
          <button
            onClick={() => switchScope("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              scope === "all" ? "bg-gold text-ink" : "text-paper-dim hover:text-paper"
            }`}
          >
            All
          </button>
          <button
            onClick={() => switchScope("following")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              scope === "following" ? "bg-gold text-ink" : "text-paper-dim hover:text-paper"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="mb-8">
        <PostComposer user={user} onPosted={handlePosted} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 stitch-h" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim">
          {loading ? "loading…" : `${posts.length} posts`}
        </span>
        <span className="h-px flex-1 stitch-h" />
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onDeleted={handleDeleted} />
          ))}
        </AnimatePresence>

        {!loading && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-display text-lg text-paper">Nothing here yet.</p>
            <p className="mt-1 text-sm text-paper-dim">
              {scope === "following"
                ? "Follow a few people, or switch back to All to see everything."
                : "Be the first to start a thread."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
