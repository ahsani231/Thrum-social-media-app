"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function CommentSection({ postId, initialComments = [], onCommentAdded }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed || posting) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((c) => [...c, data.comment]);
        setText("");
        onCommentAdded?.();
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="ml-1 mt-3 border-l border-line pl-4">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex gap-2.5"
            >
              <Avatar color={c.author.avatarColor} letter={c.author.avatarLetter} size="sm" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium">{c.author.name}</span>
                  <span className="font-mono text-[11px] text-paper-dim">
                    @{c.author.username} · {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-snug text-paper/90">{c.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="mb-3 font-mono text-xs text-paper-dim">
            No replies yet — be the first to pull this thread.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 pb-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={session?.user ? "Write a reply…" : "Log in to reply"}
            disabled={!session?.user}
            maxLength={300}
            className="w-full rounded-full border border-line-strong bg-ink-soft px-3.5 py-2 text-sm outline-none placeholder:text-paper-dim/70 focus:border-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!text.trim() || posting}
            className="shrink-0 rounded-full bg-ink-softer px-3.5 py-2 text-xs font-medium text-paper transition hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            Reply
          </button>
        </form>
      </div>
    </motion.div>
  );
}
