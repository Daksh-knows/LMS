import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

declare global {
  var prisma: PrismaClient | undefined;
}

// 1. Don't throw at the top level. Just store the string.
const connectionString = process.env.DATABASE_URL;

const createPrismaClient = () => {
  // 2. Only throw if we are actually calling this function (i.e., at runtime)
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

// 3. Singleton pattern that works with Next.js HMR
export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}