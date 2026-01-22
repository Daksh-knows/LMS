import "dotenv/config";
import { defineConfig } from "@prisma/config";

const databaseUrl = process.env.DATABASE_URL;

// --- Debugging Console Logs ---
console.log("-----------------------------------------");
console.log("DEBUG: Prisma Config Environment Check");
console.log(
  "DATABASE_URL found:",
  databaseUrl ? "YES" : "NO"
);

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL is undefined. Check your .env file!");
}
console.log("-----------------------------------------");

export default defineConfig({
  schema: "prisma/schema.prisma",
  // In Prisma 7, the url must be inside the provider name key (usually 'db')
  datasource: {
    url: databaseUrl,
  },
});