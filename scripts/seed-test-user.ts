import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

// Idempotent seed for the manager-demo test account. Safe to re-run; if the
// account already exists, the script resets its password + ensures the
// profile is in the expected state.
//
// Usage: pnpm exec tsx scripts/seed-test-user.ts

const TEST_USER = {
  email: "khaledsamen108@gmail.com",
  password: "khaled1234K",
  username: "khaled",
  displayName: "Khaled Samen",
  bio: "Builder, creator, manager. Trying out Linkintree.",
};

async function main() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL || !SERVICE) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Look up by email; create if missing.
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users.find((u) => u.email === TEST_USER.email);

  let userId: string;
  if (existing) {
    console.log(`User ${TEST_USER.email} already exists (${existing.id}); resetting password.`);
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { username: TEST_USER.username },
    });
    if (error) {
      console.error(error);
      process.exit(2);
    }
    userId = existing.id;
  } else {
    console.log(`Creating ${TEST_USER.email} …`);
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: { username: TEST_USER.username },
    });
    if (error || !data.user) {
      console.error(error);
      process.exit(2);
    }
    userId = data.user.id;
  }

  // 2. Upsert profile metadata (the trigger creates the row on insert; we
  //    update display name + bio here).
  await admin
    .from("profiles")
    .update({
      display_name: TEST_USER.displayName,
      bio: TEST_USER.bio,
      theme: { preset: "glass" },
    })
    .eq("id", userId);

  // 3. Seed a few sample blocks so the profile isn't empty when the manager
  //    visits /khaled. Idempotent: clear existing then insert.
  await admin.from("blocks").delete().eq("profile_id", userId);
  await admin
    .from("blocks")
    .insert([
      {
        profile_id: userId,
        type: "header",
        position: 0,
        is_active: true,
        data: { title: "What I'm working on" },
      },
      {
        profile_id: userId,
        type: "link",
        position: 1,
        is_active: true,
        data: {
          title: "My latest essay",
          url: "https://example.com/essay",
        },
      },
      {
        profile_id: userId,
        type: "link",
        position: 2,
        is_active: true,
        data: {
          title: "Book a 15-min coffee chat",
          url: "https://example.com/book",
          badge: "popular",
        },
      },
      {
        profile_id: userId,
        type: "social_row",
        position: 3,
        is_active: true,
        data: {
          links: [
            { platform: "x", url: "https://x.com/khaled" },
            { platform: "github", url: "https://github.com/khaled" },
            { platform: "linkedin", url: "https://linkedin.com/in/khaled" },
          ],
        },
      },
    ])
    .throwOnError();

  console.log(`Seed complete. Login: ${TEST_USER.email} / ${TEST_USER.password}`);
  console.log(`Profile: /${TEST_USER.username}`);
}

main();
