import NextAuth from "next-auth";
import { authConfig } from "@/auth_config"; 
import { NextResponse } from "next/server";

// 1. Initialize NextAuth for Edge Runtime
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // 2. req.auth is automatically populated with the session
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Define your protected routes
  const isProtectedRoute = 
    nextUrl.pathname.startsWith("/learning") || 
    nextUrl.pathname.startsWith("/dashboard") || 
    nextUrl.pathname.startsWith("/my-courses");

  // 3. Redirect unauthenticated users
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }
  // if (isLoggedIn && !req.auth?.user?.hasPremium) {
  //   return NextResponse.redirect(new URL("/enrollment", nextUrl));
  // }
  // 4. (Optional) Premium Check
  // You can now access custom fields because we typed them in next-auth.d.ts
  // if (isLoggedIn && nextUrl.pathname.startsWith("/learning/premium") && !req.auth?.user?.hasPremium) {
  //    return NextResponse.redirect(new URL("/pricing", nextUrl));
  // }

  return NextResponse.next();
});

// 5. Ensure middleware only runs on specific paths to save resources
export const config = {
  matcher: [
    // Match all protected routes
    "/learning/:path*", 
    "/dashboard/:path*", 
    "/my-courses/:path*",
    // Optional: Match root to redirect to dashboard if logged in? 
  ],
};