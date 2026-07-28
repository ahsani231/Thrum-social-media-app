"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ThreadMark from "./ThreadMark";

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />

      <Link
        href="/"
        className="absolute left-6 top-7 flex items-center gap-2 sm:left-10"
      >
        <ThreadMark className="h-6 w-6" />
        <span className="font-display text-lg">Thrum</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-gold">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-paper-dim">
            {subtitle}
          </p>
        )}

        <div className="mt-8">{children}</div>

        {footer && (
          <p className="mt-6 text-center text-sm text-paper-dim">{footer}</p>
        )}
      </motion.div>
    </div>
  );
}
