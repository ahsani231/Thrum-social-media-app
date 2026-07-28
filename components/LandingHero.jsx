"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThreadMark from "./ThreadMark";

const previewPosts = [
  {
    name: "Priya Nair",
    handle: "priyan",
    color: "#4c7c6c",
    time: "2m",
    text: "Shipped the darkroom timer app I've been tinkering with for months. Small thing, felt huge.",
    likes: 24,
    comments: 6,
  },
  {
    name: "Owen Cole",
    handle: "owencole",
    color: "#c1603f",
    time: "18m",
    text: "Sketchbook page 40 of 100. The goal was never to be good at this, just to keep the thread going.",
    likes: 58,
    comments: 11,
  },
  {
    name: "Dara Fields",
    handle: "darafields",
    color: "#8b6fb0",
    time: "1h",
    text: "Reminder that the best feedback usually shows up as a question, not a note.",
    likes: 12,
    comments: 3,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingHero() {
  return (
    <div className="relative overflow-hidden">
      {/* ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7 sm:px-10">
        <div className="flex items-center gap-2.5">
          <ThreadMark className="h-7 w-7" />
          <span className="font-display text-xl tracking-tight">Thrum</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-paper-dim transition hover:text-paper"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gold px-4 py-2 font-medium text-ink transition hover:bg-gold-soft"
          >
            Join Thrum
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-16">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            for people who make things
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-balance font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl"
          >
            Every post is a
            <br />
            <em className="italic text-gold">stitch</em> in a longer
            <br />
            thread.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-md text-balance text-lg leading-relaxed text-paper-dim"
          >
            Thrum is a small, considered social network — profiles, posts,
            comments, likes, and follows, without the noise. Pull a thread,
            see where it leads.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-full bg-gold px-7 py-3.5 font-medium text-ink transition"
            >
              <span className="relative z-10">Start your thread</span>
              <span className="absolute inset-0 -translate-x-full bg-gold-soft transition-transform duration-300 group-hover:translate-x-0" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-line-strong px-7 py-3.5 font-medium text-paper transition hover:border-paper-dim"
            >
              I already have an account
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-12 flex items-center gap-6 font-mono text-xs text-paper-dim"
          >
            <span>01 — profiles</span>
            <span className="h-px w-8 stitch-h" />
            <span>02 — posts &amp; comments</span>
            <span className="h-px w-8 stitch-h" />
            <span>03 — likes &amp; follows</span>
          </motion.div>
        </div>

        {/* stitched preview stack */}
        <div className="relative">
          <div className="absolute left-[26px] top-4 bottom-4 stitch" aria-hidden />
          <div className="flex flex-col gap-5">
            {previewPosts.map((p, i) => (
              <motion.div
                key={p.handle}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.4 + i * 0.15,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -3 }}
                className="relative ml-0 rounded-2xl border border-line bg-ink-soft/80 p-5 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm text-ink"
                    style={{ background: p.color }}
                  >
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="font-mono text-xs text-paper-dim">
                        @{p.handle} · {p.time}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-paper/90">
                      {p.text}
                    </p>
                    <div className="mt-3 flex items-center gap-4 font-mono text-xs text-paper-dim">
                      <span>♥ {p.likes}</span>
                      <span>◆ {p.comments}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
