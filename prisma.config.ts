// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "@prisma/config";

const databaseUrl = process.env.DATABASE_URL;

// --- Debugging Console Logs ---
console.log("-----------------------------------------");
console.log("DEBUG: Prisma Config Environment Check");
console.log(
  "DATABASE_URL found:",
  databaseUrl ? "YES (Value hidden for safety)" : "NO"
);

if (databaseUrl) {
  const maskedUrl = databaseUrl.split("@")[1] || "Malformed URL";
  console.log("DATABASE_HOST:", maskedUrl);
} else {
  console.error("ERROR: DATABASE_URL is undefined. Check your .env file!");
}
console.log("-----------------------------------------");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
