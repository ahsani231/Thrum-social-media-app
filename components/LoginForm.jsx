"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const inputClass =
  "w-full rounded-xl border border-line-strong bg-ink-soft px-4 py-3 text-sm text-paper placeholder:text-paper-dim/70 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("That email and password don't match.");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-paper-dim">
          Email
        </label>
        <input
          type="email"
          required
          className={inputClass}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-paper-dim">
          Password
        </label>
        <input
          type="password"
          required
          className={inputClass}
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-gold py-3 font-medium text-ink transition hover:bg-gold-soft disabled:opacity-60"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <p className="pt-2 text-center text-xs text-paper-dim">
        Demo tip: create an account below — it takes ten seconds.
      </p>
    </form>
  );
}
