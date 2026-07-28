"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThreadMark from "./ThreadMark";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const username = session?.user?.username;

  const linkClass = (active) =>
    `rounded-full px-3.5 py-1.5 text-sm transition ${
      active
        ? "bg-ink-softer text-paper"
        : "text-paper-dim hover:text-paper"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
        <Link href="/feed" className="flex items-center gap-2">
          <ThreadMark className="h-6 w-6" />
          <span className="font-display text-lg tracking-tight">Thrum</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/feed" className={linkClass(pathname === "/feed")}>
            Feed
          </Link>
          {username && (
            <Link
              href={`/profile/${username}`}
              className={linkClass(pathname === `/profile/${username}`)}
            >
              Profile
            </Link>
          )}
          <button
            onClick={() => signOut({ redirect: false }).then(() => router.push("/"))}
            className="ml-1 rounded-full px-3.5 py-1.5 text-sm text-paper-dim transition hover:text-coral"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
