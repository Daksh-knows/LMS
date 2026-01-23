// lib/auth-utils.ts
import { auth } from "@/auth";

/**
 * Retrieves the current user from the NextAuth session.
 * This replaces manual cookie parsing.
 */
export async function getCurrentUser() {
  // 1. Fetch the session using NextAuth's secure helper
  const session = await auth();

  // 2. Return null if no session exists or user is not authenticated
  if (!session?.user) {
    return null;
  }

  // 3. Return the user object
  return {
    id: session.user.id,
    email: session.user.email?? "",
    name: session.user.name??"user",
    role: session.user.role,
    hasPremium: session.user.hasPremium?? false,
    image: session.user.image,
  };
}