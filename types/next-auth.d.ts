// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  // 1. Extend the Session type (what you access in components)
  interface Session {
    user: {
      id: string;
      role: string;
      hasPremium: boolean;
      hasRegistered: boolean;
    } & DefaultSession["user"];
  }

  // 2. Extend the User type (what comes from the database adapter)
  interface User {
    role: string;
    hasPremium: boolean;
    hasRegistered: boolean;
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT type
  interface JWT {
    id: string;
    role: string;
    hasPremium: boolean;
    hasRegistered: boolean;
  }
}

// Add this to help the Prisma Adapter specifically
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string;
    hasPremium: boolean;
    hasRegistered: boolean;
  }
}