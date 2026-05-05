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

const REAL_BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36";

async function main() {
  const slug = randomUUID().slice(0, 8);
  const username = `problocks_${slug}`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${username}@smoke.test`,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: { username },
  });
  if (error || !created.user) {
    console.error(error);
    process.exit(1);
  }
  const userId = created.user.id;

  try {
    await admin
      .from("blocks")
      .insert([
        {
          profile_id: userId,
          type: "embed",
          position: 0,
          is_active: true,
          data: {
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            provider: "auto",
          },
        },
        {
          profile_id: userId,
          type: "product",
          position: 1,
          is_active: true,
          data: {
            title: "Test product",
            url: "https://example.com/buy",
            price_text: "$29",
            image_url: "https://example.com/img.png",
          },
        },
        {
          profile_id: userId,
          type: "email_capture",
          position: 2,
          is_active: true,
          data: {
            headline: "Join the list",
            cta: "Subscribe",
          },
        },
      ])
      .throwOnError();

    const res = await fetch(`${SITE}/${username}`, {
      headers: { "User-Agent": REAL_BROWSER_UA },
    });
    const html = await res.text();

    const checks = {
      status200: res.status === 200,
      embedIframe: html.includes("youtube-nocookie.com/embed/dQw4w9WgXcQ"),
      productTitle: html.includes("Test product"),
      productPrice: html.includes("$29"),
      productBuy: html.includes(">Buy<"),
      emailHeadline: html.includes("Join the list"),
      emailSubmitButton: html.includes(">Subscribe<"),
    };
    console.log("checks:", checks);
    const passed = Object.values(checks).every(Boolean);
    if (!passed) {
      console.error("SOME CHECKS FAILED");
      process.exit(2);
    }
    console.log("All checks passed.");
  } finally {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
  }
}

main();
