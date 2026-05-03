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
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function main() {
  const slug = randomUUID().slice(0, 8);
  const username = `analytics_${slug}`;
  const email = `${username}@smoke.test`;
  console.log(`fixture: ${username}`);

  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    { email, password: randomUUID(), email_confirm: true, user_metadata: { username } },
  );
  if (createErr || !created.user) {
    console.error(createErr);
    process.exit(1);
  }
  const userId = created.user.id;

  try {
    const { data: blk } = await admin
      .from("blocks")
      .insert({
        profile_id: userId,
        type: "link",
        position: 0,
        is_active: true,
        data: { title: "smoke", url: "https://example.com/smoke" },
      })
      .select("id")
      .single()
      .throwOnError();
    const blockId = blk!.id;

    // 1) Hit the public profile as a real browser → should log a page view.
    const profileRes = await fetch(`${SITE}/${username}`, {
      headers: {
        "User-Agent": REAL_BROWSER_UA,
        "X-Forwarded-For": "203.0.113.10",
        "X-Vercel-IP-Country": "DE",
      },
    });
    console.log(`profile page: ${profileRes.status}`);

    // 2) Hit /api/click — should 302 to the stored URL and log a click.
    const clickRes = await fetch(`${SITE}/api/click/${blockId}`, {
      headers: {
        "User-Agent": REAL_BROWSER_UA,
        "X-Forwarded-For": "203.0.113.10",
        "X-Vercel-IP-Country": "DE",
      },
      redirect: "manual",
    });
    console.log(
      `click route: ${clickRes.status} location=${clickRes.headers.get("location")}`,
    );

    // 3) As a bot — should still 302 but NOT log a click.
    const botRes = await fetch(`${SITE}/api/click/${blockId}`, {
      headers: { "User-Agent": "Googlebot/2.1" },
      redirect: "manual",
    });
    console.log(`bot click: ${botRes.status} location=${botRes.headers.get("location")}`);

    // 4) Open-redirect attempt — query string should NOT override stored URL.
    const evilRes = await fetch(
      `${SITE}/api/click/${blockId}?to=https://attacker.example`,
      {
        headers: { "User-Agent": REAL_BROWSER_UA },
        redirect: "manual",
      },
    );
    const evilLocation = evilRes.headers.get("location");

    // 5) Inactive block click → 404.
    const { data: inactiveBlk } = await admin
      .from("blocks")
      .insert({
        profile_id: userId,
        type: "link",
        position: 1,
        is_active: false,
        data: { title: "inactive", url: "https://example.com/inactive" },
      })
      .select("id")
      .single()
      .throwOnError();
    const inactiveRes = await fetch(`${SITE}/api/click/${inactiveBlk!.id}`, {
      headers: { "User-Agent": REAL_BROWSER_UA },
      redirect: "manual",
    });

    // Wait briefly for after()/fire-and-forget inserts to land.
    await new Promise((r) => setTimeout(r, 1000));

    const { data: clicksData } = await admin
      .from("clicks")
      .select("id, country, device, browser")
      .eq("profile_id", userId);
    const { data: pvData } = await admin
      .from("page_views")
      .select("id, country, device, browser")
      .eq("profile_id", userId);

    const checks = {
      publicPage200: profileRes.status === 200,
      clickRedirected: clickRes.status === 302,
      clickRedirectsToStoredUrl:
        clickRes.headers.get("location") === "https://example.com/smoke",
      botStillRedirected: botRes.status === 302,
      openRedirectIgnored: evilLocation === "https://example.com/smoke",
      inactiveBlockIs404: inactiveRes.status === 404,
      pageViewLogged: (pvData?.length ?? 0) === 1,
      pageViewCountryDE: pvData?.[0]?.country === "DE",
      pageViewDeviceDesktop: pvData?.[0]?.device === "desktop",
      pageViewBrowserChrome: pvData?.[0]?.browser === "Chrome",
      // Real-browser hit (#2) + open-redirect attempt (#4) both legitimately
      // log a click (route always redirected to the stored URL). Bot (#3) is
      // filtered. Inactive (#5) 404s before the log path. So count == 2.
      clicksLogged: (clicksData?.length ?? 0) === 2,
      botClickFiltered: clicksData?.every((r) => r.browser !== null) ?? true,
      clickFromGermany: clicksData?.[0]?.country === "DE",
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
