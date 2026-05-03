import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const slug = randomUUID().slice(0, 8);
  const username = `smoke_${slug}`;
  const email = `${username}@smoke.test`;

  console.log(`Creating fixture user: ${username}`);
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username },
    },
  );
  if (createErr || !created.user) {
    console.error("createUser failed:", createErr);
    process.exit(1);
  }
  const userId = created.user.id;

  try {
    await admin
      .from("profiles")
      .update({
        display_name: "Smoke Test",
        bio: "RLS-test fixture profile.",
        theme: { preset: "midnight" },
      })
      .eq("id", userId);

    await admin
      .from("blocks")
      .insert([
        {
          profile_id: userId,
          type: "header",
          position: 0,
          is_active: true,
          data: { title: "Active section" },
        },
        {
          profile_id: userId,
          type: "link",
          position: 1,
          is_active: true,
          data: { title: "Active link", url: "https://example.com/active" },
        },
        {
          profile_id: userId,
          type: "link",
          position: 2,
          is_active: false,
          data: {
            title: "Hidden link",
            url: "https://example.com/hidden",
          },
        },
      ])
      .throwOnError();

    const url = `${SITE}/${username}`;
    console.log(`Fetching ${url}`);
    const res = await fetch(url);
    const html = await res.text();

    const checks = {
      status200: res.status === 200,
      hasDisplayName: html.includes("Smoke Test"),
      hasUsername: html.includes(`@${username}`),
      hasBio: html.includes("RLS-test fixture profile"),
      activeHeaderRendered: html.includes("Active section"),
      activeLinkRendered: html.includes("Active link"),
      hiddenLinkAbsent: !html.includes("Hidden link"),
      poweredBy: html.includes("Powered by Linkintree"),
      jsonLd: html.includes('"@type":"Person"'),
      midnightTheme: html.includes("--background:0 0% 6%"),
    };

    console.log("checks:", checks);
    const allPassed = Object.values(checks).every(Boolean);
    if (!allPassed) {
      console.error("SOME CHECKS FAILED");
      process.exit(2);
    }
    console.log("All checks passed.");
  } finally {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  }
}

main();
