import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deletePost, getPostById } from "@/lib/data";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await auth();
  const post = getPostById(id, session?.user?.id);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  try {
    deletePost(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
