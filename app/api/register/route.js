import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/data";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/i;

export async function POST(req) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Fill in every field to get started." },
        { status: 400 }
      );
    }
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        {
          error:
            "Handles are 3-20 characters: letters, numbers, underscores only.",
        },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password needs at least 6 characters." },
        { status: 400 }
      );
    }
    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: "That email already has an account." },
        { status: 409 }
      );
    }
    if (getUserByUsername(username)) {
      return NextResponse.json(
        { error: "That handle is taken — try another." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = createUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password: hashed,
    });

    return NextResponse.json({
      ok: true,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong creating your account." },
      { status: 500 }
    );
  }
}
