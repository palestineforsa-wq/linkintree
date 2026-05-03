import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    const rows = await sql`select version() as version, current_database() as db, now() as ts`;
    console.log("OK", rows[0]);
    await sql.end({ timeout: 5 });
    process.exit(0);
  } catch (err) {
    console.error("FAIL", err instanceof Error ? err.message : err);
    await sql.end({ timeout: 5 }).catch(() => {});
    process.exit(2);
  }
}

main();
