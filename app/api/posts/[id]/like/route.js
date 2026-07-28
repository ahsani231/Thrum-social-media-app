import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleLike } from "@/lib/data";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to like posts." }, { status: 401 });
  }
  const result = toggleLike(id, session.user.id);
  return NextResponse.json(result);
}
