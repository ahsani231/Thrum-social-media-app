import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  const protectedRoute = pathname.startsWith("/feed") || pathname.startsWith("/profile");
  const authRoute = pathname === "/login" || pathname === "/signup";

  if (protectedRoute && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  if (authRoute && isLoggedIn) {
    const url = new URL("/feed", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/login", "/signup"],
};
