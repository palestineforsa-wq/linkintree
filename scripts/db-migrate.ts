import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  // Migrations include DDL + RLS + seeds. One connection, sequential.
  const sql = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(sql);

  try {
    console.log("Applying migrations from drizzle/migrations …");
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    console.log("OK — migrations applied.");
  } catch (err) {
    console.error("FAIL", err);
    process.exit(2);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
