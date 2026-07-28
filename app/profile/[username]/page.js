import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserByUsername, getUserPosts, publicUser } from "@/lib/data";
import Navbar from "@/components/Navbar";
import ProfileClient from "@/components/ProfileClient";

export async function generateMetadata({ params }) {
  const { username } = await params;
  return { title: `@${username} — Thrum` };
}

export default async function ProfilePage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { username } = await params;
  const target = getUserByUsername(username);
  if (!target) notFound();

  const profile = publicUser(target, session.user.id);
  const posts = getUserPosts(target.id, session.user.id);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <ProfileClient profile={profile} initialPosts={posts} />
      </main>
    </div>
  );
}
