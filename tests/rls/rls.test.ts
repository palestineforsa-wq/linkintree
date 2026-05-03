import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Spec §10 checkbox 1: hits Supabase as anon and asserts cross-user reads fail.
// Skips when env isn't configured so dev `pnpm test` without creds still works.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const skip = !URL || !PUBLISHABLE || !SERVICE;
const describeOrSkip = skip ? describe.skip : describe;

if (skip) {
  // eslint-disable-next-line no-console
  console.warn(
    "[rls] skipped — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY to run.",
  );
}

describeOrSkip("RLS — public profile path", () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  let userId: string;
  let otherUserId: string;
  let activeBlockId: string;
  let inactiveBlockId: string;
  const username = `rlstest_${randomUUID().slice(0, 8)}`;
  const otherUsername = `rlsother_${randomUUID().slice(0, 8)}`;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    anon = createClient(URL!, PUBLISHABLE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const u1 = await admin.auth.admin.createUser({
      email: `${username}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
    });
    if (u1.error || !u1.data.user) throw u1.error;
    userId = u1.data.user.id;

    const u2 = await admin.auth.admin.createUser({
      email: `${otherUsername}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
    });
    if (u2.error || !u2.data.user) throw u2.error;
    otherUserId = u2.data.user.id;

    await admin
      .from("profiles")
      .insert([
        { id: userId, username },
        { id: otherUserId, username: otherUsername },
      ])
      .throwOnError();

    const { data: blocks } = await admin
      .from("blocks")
      .insert([
        {
          profile_id: userId,
          type: "link",
          position: 0,
          is_active: true,
          data: { title: "active", url: "https://example.com" },
        },
        {
          profile_id: userId,
          type: "link",
          position: 1,
          is_active: false,
          data: { title: "draft", url: "https://example.com/draft" },
        },
      ])
      .select("id, is_active")
      .throwOnError();
    activeBlockId = blocks!.find((b) => b.is_active)!.id;
    inactiveBlockId = blocks!.find((b) => !b.is_active)!.id;

    await admin
      .from("clicks")
      .insert({
        block_id: activeBlockId,
        profile_id: userId,
        visitor_hash: "test",
      })
      .throwOnError();
  }, 30_000);

  afterAll(async () => {
    if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
    if (otherUserId)
      await admin.auth.admin.deleteUser(otherUserId).catch(() => {});
  }, 30_000);

  it("anon CAN read profiles (public link-in-bio pages)", async () => {
    const { data, error } = await anon
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();
    expect(error).toBeNull();
    expect(data?.username).toBe(username);
  });

  it("anon CAN read active blocks", async () => {
    const { data, error } = await anon
      .from("blocks")
      .select("id")
      .eq("id", activeBlockId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it("anon CANNOT read inactive blocks", async () => {
    const { data, error } = await anon
      .from("blocks")
      .select("id")
      .eq("id", inactiveBlockId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0); // RLS hides; no error, just empty
  });

  it("anon CANNOT read clicks", async () => {
    const { data, error } = await anon
      .from("clicks")
      .select("id")
      .eq("profile_id", userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anon CANNOT read subscriptions", async () => {
    const { data, error } = await anon
      .from("subscriptions")
      .select("user_id")
      .eq("user_id", userId);
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anon CANNOT insert a profile (impersonation attempt)", async () => {
    const { error } = await anon.from("profiles").insert({
      id: randomUUID(),
      username: `attacker_${randomUUID().slice(0, 8)}`,
    });
    expect(error).not.toBeNull(); // RLS rejects: violates row-level security
  });

  it("anon CANNOT insert a block on someone else's profile", async () => {
    const { error } = await anon.from("blocks").insert({
      profile_id: userId,
      type: "link",
      position: 99,
      is_active: true,
      data: { title: "spam", url: "https://attacker.example" },
    });
    expect(error).not.toBeNull();
  });

  it("anon CANNOT update a profile", async () => {
    const { error } = await anon
      .from("profiles")
      .update({ display_name: "hacked" })
      .eq("id", userId);
    // PostgREST returns no error but 0 rows affected when RLS blocks UPDATE.
    // Verify by reading back.
    expect(error).toBeNull();
    const { data } = await anon
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    expect(data?.display_name).toBeNull();
  });

  it("anon CAN read reserved_usernames (signup needs availability check)", async () => {
    const { data, error } = await anon
      .from("reserved_usernames")
      .select("username")
      .eq("username", "admin")
      .single();
    expect(error).toBeNull();
    expect(data?.username).toBe("admin");
  });

  it("citext: usernames are case-insensitive unique", async () => {
    const { error } = await admin.from("profiles").insert({
      id: randomUUID(),
      username: username.toUpperCase(),
    });
    expect(error?.code).toBe("23505"); // unique_violation
  });
});
