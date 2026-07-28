"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(false);

  async function handleClick() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    if (nextLiked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setCount(data.likeCount);
      } else {
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
      }
    } catch {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className="group relative flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-xs transition"
      aria-pressed={liked}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        {burst && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 2.1, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inline-block h-4 w-4 rounded-full bg-coral/40"
          />
        )}
        <motion.svg
          animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          viewBox="0 0 24 24"
          className="relative h-4 w-4"
          fill={liked ? "var(--coral)" : "none"}
          stroke={liked ? "var(--coral)" : "var(--paper-dim)"}
          strokeWidth="2"
        >
          <path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4a5 5 0 0 1 6.4 2.6A5 5 0 0 1 18.4 4c3.6.5 5.2 4.1 3.6 7.7C19.5 16.4 12 21 12 21z" />
        </motion.svg>
      </span>
      <span className={liked ? "text-coral" : "text-paper-dim group-hover:text-paper"}>
        {count}
      </span>
    </button>
  );
}
