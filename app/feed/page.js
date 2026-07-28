import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeed, getUserById } from "@/lib/data";
import Navbar from "@/components/Navbar";
import FeedClient from "@/components/FeedClient";

export const metadata = { title: "Your feed — Thrum" };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const me = getUserById(session.user.id);
  const posts = getFeed(session.user.id, { scope: "all" });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <FeedClient
          initialPosts={posts}
          user={{
            id: me.id,
            name: me.name,
            username: me.username,
            avatarColor: me.avatarColor,
            avatarLetter: me.avatarLetter,
          }}
        />
      </main>
    </div>
  );
}
