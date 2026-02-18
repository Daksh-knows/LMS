import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

const providers: any[] = [];

/* ---------------- Credentials Provider ---------------- */
providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;

      if (!email || !password) return null;

      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) return null;

      const passwordsMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordsMatch) return null;

      if (!user.isVerified) {
        throw new Error("Email not verified. Please verify your OTP.");
      }

      return user;
    },
  })
);

/* ---------------- Google OAuth ---------------- */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

/* ---------------- GitHub OAuth ---------------- */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

/* ---------------- NextAuth ---------------- */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers,

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.hasPremium = (user as any).hasPremium;
        token.hasRegistered = (user as any).hasRegistered;
        token.isTempPassword = (user as any).isTempPassword;
      }

      if (trigger === "update" && session) {
        if (session.hasPremium !== undefined)
          token.hasPremium = session.hasPremium;

        if (session.hasRegistered !== undefined)
          token.hasRegistered = session.hasRegistered;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasPremium = token.hasPremium as boolean;
        session.user.hasRegistered = token.hasRegistered as boolean;
        session.user.isTempPassword = token.isTempPassword as boolean;
      }
      return session;
    },
  },
});
