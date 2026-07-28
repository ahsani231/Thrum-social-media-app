import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByUsername, toggleFollow } from "@/lib/data";

export async function POST(req, { params }) {
  const { username } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to follow people." }, { status: 401 });
  }

  const target = getUserByUsername(username);
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const result = toggleFollow(session.user.id, target.id);
  return NextResponse.json(result);
}
