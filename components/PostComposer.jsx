"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";

const LIMIT = 500;

export default function PostComposer({ user, onPosted }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || posting) return;

    setPosting(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't post that.");
      } else {
        setText("");
        onPosted?.(data.post);
      }
    } finally {
      setPosting(false);
    }
  }

  const remaining = LIMIT - text.length;

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border bg-ink-soft/70 p-5 transition-colors ${
        focused ? "border-gold/60" : "border-line"
      }`}
    >
      <div className="flex gap-3.5">
        <Avatar color={user.avatarColor} letter={user.avatarLetter} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={LIMIT}
            rows={focused || text ? 3 : 1}
            placeholder="What are you stitching together today?"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-paper-dim/70"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 text-sm text-coral"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-2 flex items-center justify-between">
            <span
              className={`font-mono text-xs ${
                remaining < 40 ? "text-coral" : "text-paper-dim"
              }`}
            >
              {text.length > 0 ? `${remaining} left` : ""}
            </span>
            <button
              type="submit"
              disabled={!text.trim() || posting}
              className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink transition hover:bg-gold-soft disabled:opacity-40"
            >
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
