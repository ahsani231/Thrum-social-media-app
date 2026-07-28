"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const inputClass =
  "w-full rounded-xl border border-line-strong bg-ink-soft px-4 py-3 text-sm text-paper placeholder:text-paper-dim/70 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created — please log in.");
      router.push("/login");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-paper-dim">
          Name
        </label>
        <input
          required
          className={inputClass}
          placeholder="Priya Nair"
          value={form.name}
          onChange={update("name")}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-paper-dim">
          Handle
        </label>
        <div className="flex items-center rounded-xl border border-line-strong bg-ink-soft pl-4 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold">
          <span className="font-mono text-sm text-paper-dim">@</span>
          <input
            required
            className="w-full bg-transparent py-3 pl-1 pr-4 text-sm text-paper placeholder:text-paper-dim/70 outline-none"
            placeholder="priyan"
            value={form.username}
            onChange={update("username")}
          />
        </div>
      </div>
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
          onChange={update("email")}
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
          placeholder="At least 6 characters"
          value={form.password}
          onChange={update("password")}
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
        {loading ? "Creating your profile…" : "Create account"}
      </button>
    </form>
  );
}
