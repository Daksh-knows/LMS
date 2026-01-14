import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("user_data")?.value;

  // 1. If no cookie, redirect to login
  if (!session && request.nextUrl.pathname.startsWith("/learning")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 2. High-level Premium check (Optional: depends on if 'hasPremium' is in the cookie)
  // If your coworker puts the premium status in the cookie, you can block here.

  return NextResponse.next();
}

// Ensure middleware only runs on protected routes
export const config = {
  matcher: ["/learning/:path*", "/dashboard/:path*", "/my-courses/:path*"],
};
