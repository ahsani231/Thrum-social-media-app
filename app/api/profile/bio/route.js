import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateBio } from "@/lib/data";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { bio } = await req.json();
  const trimmed = (bio ?? "").toString().slice(0, 160);
  updateBio(session.user.id, trimmed);
  return NextResponse.json({ ok: true, bio: trimmed });
}
