import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPost, getFeed } from "@/lib/data";

export async function GET(req) {
  const session = await auth();
  const scope = req.nextUrl.searchParams.get("scope") || "all";
  const posts = getFeed(session?.user?.id, { scope });
  return NextResponse.json({ posts });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to post." }, { status: 401 });
  }

  const { content } = await req.json();
  const trimmed = content?.toString().trim() ?? "";

  if (!trimmed) {
    return NextResponse.json(
      { error: "Your post can't be empty." },
      { status: 400 }
    );
  }
  if (trimmed.length > 500) {
    return NextResponse.json(
      { error: "Keep it under 500 characters." },
      { status: 400 }
    );
  }

  const post = createPost(session.user.id, trimmed);
  return NextResponse.json({ post }, { status: 201 });
}
