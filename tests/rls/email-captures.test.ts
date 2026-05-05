import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Spec §4: email_captures owner-read only; insert via service role (the
// captureEmailAction does this on the server). Anon must not be able to
// read or write directly via the JS client.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !URL || !PUBLISHABLE || !SERVICE;
const describeOrSkip = skip ? describe.skip : describe;

describeOrSkip("RLS — email_captures isolation", () => {
  let admin: SupabaseClient;
  let userId: string;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const u = await admin.auth.admin.createUser({
      email: `capowner_${randomUUID().slice(0, 8)}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username: `cap_${randomUUID().slice(0, 8)}` },
    });
    if (u.error || !u.data.user) throw u.error;
    userId = u.data.user.id;

    await admin
      .from("email_captures")
      .insert({
        profile_id: userId,
        email: "fan1@example.com",
      })
      .throwOnError();
    await admin
      .from("email_captures")
      .insert({
        profile_id: userId,
        email: "fan2@example.com",
      })
      .throwOnError();
  }, 30_000);

  afterAll(async () => {
    if (userId) await admin.auth.admin.deleteUser(userId).catch(() => {});
  });

  it("anon CANNOT read captures", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { data } = await anon
      .from("email_captures")
      .select("id")
      .eq("profile_id", userId);
    expect(data).toEqual([]);
  });

  it("anon CANNOT directly insert (server action uses service role)", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { error } = await anon.from("email_captures").insert({
      profile_id: userId,
      email: "spam@example.com",
    });
    expect(error).not.toBeNull();
  });

  it("service-role can read all captures", async () => {
    const { data } = await admin
      .from("email_captures")
      .select("id")
      .eq("profile_id", userId);
    expect((data ?? []).length).toBe(2);
  });

  it("(profile_id, email) is unique — duplicate inserts are rejected", async () => {
    const { error } = await admin.from("email_captures").insert({
      profile_id: userId,
      email: "fan1@example.com", // already exists from beforeAll
    });
    expect(error?.code).toBe("23505");
  });
});
