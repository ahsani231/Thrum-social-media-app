import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByUsername, getUserPosts, publicUser } from "@/lib/data";

export async function GET(req, { params }) {
  const { username } = await params;
  const session = await auth();
  const user = getUserByUsername(username);

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const profile = publicUser(user, session?.user?.id);
  const posts = getUserPosts(user.id, session?.user?.id);

  return NextResponse.json({ profile, posts });
}
