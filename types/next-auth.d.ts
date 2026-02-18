// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasPremium: boolean;
      hasRegistered: boolean;
      isTempPassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    hasPremium: boolean;
    hasRegistered: boolean;
    isTempPassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    hasPremium?: boolean;
    hasRegistered?: boolean;
    isTempPassword?: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string;
    hasPremium: boolean;
    hasRegistered: boolean;
    isTempPassword: boolean;
  }
}
