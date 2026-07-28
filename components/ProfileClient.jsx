"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import PostCard from "./PostCard";

const stat = (n, label) => (
  <div className="text-center">
    <div className="font-display text-xl">{n}</div>
    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">
      {label}
    </div>
  </div>
);

export default function ProfileClient({ profile, initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");
  const [bioDraft, setBioDraft] = useState(profile.bio || "");
  const [saving, setSaving] = useState(false);

  function handleDeleted(id) {
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  function handleFollowChange(following) {
    setFollowerCount((c) => c + (following ? 1 : -1));
  }

  async function saveBio() {
    setSaving(true);
    const res = await fetch("/api/profile/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: bioDraft }),
    });
    setSaving(false);
    if (res.ok) {
      setBio(bioDraft);
      setEditingBio(false);
    }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-line bg-ink-soft/70 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar color={profile.avatarColor} letter={profile.avatarLetter} size="lg" />
            <div>
              <h1 className="font-display text-2xl tracking-tight">{profile.name}</h1>
              <p className="font-mono text-sm text-paper-dim">@{profile.username}</p>
            </div>
          </div>

          {!profile.isSelf && (
            <FollowButton
              username={profile.username}
              initialFollowing={profile.isFollowing}
              onChange={handleFollowChange}
            />
          )}
        </div>

        <div className="mt-4">
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                maxLength={160}
                rows={2}
                className="w-full resize-none rounded-xl border border-line-strong bg-ink px-3.5 py-2.5 text-sm outline-none focus:border-gold"
                placeholder="Tell people what you're stitching together."
              />
              <div className="flex gap-2">
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-ink transition hover:bg-gold-soft disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setBioDraft(bio);
                    setEditingBio(false);
                  }}
                  className="rounded-full border border-line-strong px-4 py-1.5 text-xs text-paper-dim transition hover:text-paper"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-paper/90">
              {bio || (
                <span className="text-paper-dim italic">
                  {profile.isSelf ? "Add a bio to introduce yourself." : "No bio yet."}
                </span>
              )}
              {profile.isSelf && (
                <button
                  onClick={() => setEditingBio(true)}
                  className="ml-2 font-mono text-xs text-gold hover:text-gold-soft"
                >
                  edit
                </button>
              )}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-8 border-t border-line pt-5">
          {stat(profile.postCount, "posts")}
          {stat(followerCount, "followers")}
          {stat(profile.followingCount, "following")}
        </div>
      </motion.div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 stitch-h" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim">
          {posts.length} posts
        </span>
        <span className="h-px flex-1 stitch-h" />
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onDeleted={handleDeleted} />
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-display text-lg">Nothing posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
