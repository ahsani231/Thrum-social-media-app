"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function FollowButton({ username, initialFollowing, onChange }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    onChange?.(next);

    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
        onChange?.(data.following);
      } else {
        setFollowing(!next);
        onChange?.(!next);
      }
    } catch {
      setFollowing(!next);
      onChange?.(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium transition ${
        following
          ? "border border-line-strong text-paper-dim hover:border-coral hover:text-coral"
          : "bg-gold text-ink hover:bg-gold-soft"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={following ? "following" : "follow"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="inline-block"
        >
          {following ? "Following" : "Follow"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
