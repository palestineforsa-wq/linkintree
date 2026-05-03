import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const tables = await sql<{ relname: string }[]>`
      SELECT c.relname FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY c.relname
    `;
    console.log("tables:", tables.map((r) => r.relname));

    const rls = await sql<{ relname: string; relrowsecurity: boolean }[]>`
      SELECT c.relname, c.relrowsecurity FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY c.relname
    `;
    console.log("RLS enabled:", rls.every((r) => r.relrowsecurity));
    const noRls = rls.filter((r) => !r.relrowsecurity).map((r) => r.relname);
    if (noRls.length) console.log("⚠ tables without RLS:", noRls);

    const policies = await sql<{ tablename: string; policyname: string }[]>`
      SELECT tablename, policyname FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    console.log("policies:", policies.length);
    for (const p of policies) console.log(`  ${p.tablename}: ${p.policyname}`);

    const indexes = await sql<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `;
    console.log("custom indexes:", indexes.map((r) => r.indexname));

    const reserved = await sql<{ count: string }[]>`SELECT count(*)::text FROM reserved_usernames`;
    console.log("reserved_usernames count:", reserved[0]?.count);

    const ext = await sql<{ extname: string }[]>`
      SELECT extname FROM pg_extension WHERE extname IN ('citext', 'pgcrypto', 'uuid-ossp')
    `;
    console.log("extensions:", ext.map((r) => r.extname));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
