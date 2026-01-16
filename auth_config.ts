import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // 1. Session Strategy
  // We use JWT because it works best with Edge Middleware (no DB queries needed per request)
  session: { strategy: "jwt" },

  // 2. Pages Configuration
  // Tells NextAuth where to redirect users for sign-in/error
  pages: {
    signIn: "/signin", 
    error: "/error", 
  },

  // 3. Callbacks
  // These run on the Edge, allowing you to customize the session object
  callbacks: {
    // A. Authorized Callback (Used by Middleware)
    // You can put simple route protection logic here, or keep it in middleware.ts
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLearning = nextUrl.pathname.startsWith('/learning');
      
      // If trying to access protected routes
      if (isOnDashboard || isOnLearning) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },

    // B. JWT Callback (Populate token)
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.hasPremium = (user as any).hasPremium;
      }
      if (trigger === "update" && session) {
        token.hasPremium = session.hasPremium;
      }
      return token;
    },

    // C. Session Callback (Populate session from token)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasPremium = token.hasPremium as boolean;
      }
      return session;
    }
  },

  // 4. Providers
  // We keep this array EMPTY here.
  // The real providers (Google, GitHub, Credentials) are added in auth.ts
  // This satisfies the type requirements without breaking the Edge runtime.
  providers: [], 

} satisfies NextAuthConfig;