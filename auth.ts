import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import bcrypt from "bcryptjs";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // We use JWT to avoid database hits on every request
  pages: {
    signIn: "/signin", // Redirect here if auth fails
  },
  providers: [
    // 1. Google Provider
    Google({
  clientId: requiredEnv("GOOGLE_CLIENT_ID"),
  clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
  allowDangerousEmailAccountLinking: true,
}),

Github({
  clientId: requiredEnv("GITHUB_CLIENT_ID"),
  clientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
  allowDangerousEmailAccountLinking: true,
}),
    // 3. Email/Password Provider
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;

        const user = await db.user.findUnique({
          where: { email },
        });

        // Check if user exists and has a password (OAuth users might not)
        if (!user || !user.password) {
          return null;
        }

        // Verify Password
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordsMatch) return null;

        // Check your custom Verification logic
        if (!user.isVerified) {
          throw new Error("Email not verified. Please verify your OTP.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    // 1. JWT Callback: Called whenever a token is created/updated
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in: add custom fields to token
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.hasPremium = (user as any).hasPremium;
      }

      // Update session trigger (e.g. after Buying Premium)
      if (trigger === "update" && session) {
        token.hasPremium = session.hasPremium;
      }
      
      return token;
    },
    // 2. Session Callback: Called whenever useSession/auth() is used
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasPremium = token.hasPremium as boolean;
      }
      return session;
    },
    // 3. Sign In Callback: Auto-verify OAuth users
    // async signIn({ user, account }) {
    //   if (account?.provider !== "credentials") {
    //     // If logging in via Google/GitHub, mark them as verified automatically.
    //     // We removed 'emailVerified' because your Prisma Client threw an error for it.
    //     if (user.id) {
    //         await db.user.update({
    //             where: { id: user.id },
    //             data: { isVerified: true } 
    //         });
    //     }
    //   }
    //   return true;
    // }
  },
  // ADD THIS: Events handle side-effects like "verify email" safely
  events: {
    async linkAccount({ user }) {
      // This runs when a Google/GitHub account is linked to a user.
      // We trust social providers, so we mark the email as verified.
      await db.user.update({
        where: { id: user.id },
        data: { 
            isVerified: true,
            emailVerified: new Date() 
        },
      });
    },
  },
  // --- FIX ENDS HERE ---
});