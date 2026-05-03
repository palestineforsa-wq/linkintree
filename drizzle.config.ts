import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js loads .env.local automatically; drizzle-kit doesn't, so we do it here.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
