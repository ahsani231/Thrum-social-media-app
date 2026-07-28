import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addComment, getComments, getPostById } from "@/lib/data";

export async function GET(req, { params }) {
  const { id } = await params;
  const comments = getComments(id);
  return NextResponse.json({ comments });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { content } = await req.json();
  const trimmed = content?.toString().trim() ?? "";
  if (!trimmed) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }
  if (trimmed.length > 300) {
    return NextResponse.json({ error: "Keep it under 300 characters." }, { status: 400 });
  }

  const comment = addComment(id, session.user.id, trimmed);
  return NextResponse.json({ comment }, { status: 201 });
}
