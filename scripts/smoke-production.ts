import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Hits a deployed URL (NEXT_PUBLIC_SITE_URL or first arg), creates a fixture
// profile via service-role admin, asserts the rendered HTML contains the
// expected markers, then cleans up. Used by the GitHub Actions deploy job
// after each production push.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL;

if (!URL || !SERVICE || !SITE) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + (NEXT_PUBLIC_SITE_URL or argv[2])",
  );
  process.exit(1);
}

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const slug = randomUUID().slice(0, 8);
  const username = `prodsmoke_${slug}`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${username}@smoke.test`,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: { username },
  });
  if (error || !created.user) {
    console.error("createUser failed", error);
    process.exit(1);
  }
  const userId = created.user.id;

  try {
    await admin
      .from("profiles")
      .update({
        display_name: "Production Smoke",
        bio: "Automated post-deploy fixture.",
        theme: { preset: "midnight" },
      })
      .eq("id", userId);

    await admin
      .from("blocks")
      .insert({
        profile_id: userId,
        type: "link",
        position: 0,
        is_active: true,
        data: { title: "Active link", url: "https://example.com/" },
      })
      .throwOnError();

    const url = `${SITE}/${username}`;
    console.log(`Fetching ${url}`);
    const res = await fetch(url, {
      // Vercel sometimes returns 308 to canonical URL; follow.
      redirect: "follow",
      headers: { "User-Agent": "linkintree-prod-smoke/1.0" },
    });
    const html = await res.text();

    const checks = {
      status200: res.status === 200,
      hasDisplayName: html.includes("Production Smoke"),
      hasUsername: html.includes(`@${username}`),
      hasBio: html.includes("Automated post-deploy fixture"),
      activeLinkRendered: html.includes("Active link"),
      jsonLd: html.includes('"@type":"Person"'),
      midnightTheme: html.includes("--background:0 0% 6%"),
      noStackTraces: !html.toLowerCase().includes("stack trace"),
    };

    console.log("checks:", checks);
    const passed = Object.values(checks).every(Boolean);
    if (!passed) {
      console.error("PRODUCTION SMOKE FAILED");
      process.exit(2);
    }
    console.log("Production smoke passed.");
  } finally {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  }
}

main();
