import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

const createPrismaClient = () => {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  // If we have no connection string and it's NOT the build phase, crash.
  if (!connectionString && !isBuildPhase) {
    throw new Error("DATABASE_URL is not defined.");
  }

  // If we have a connection string, use the Neon Adapter
  if (connectionString) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }

  // Fallback for Build Phase: 
  // We cast to 'any' or provide a dummy object to satisfy the constructor requirements
  // since this instance will never actually be used to query data during build.
  return new PrismaClient({} as any);
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}