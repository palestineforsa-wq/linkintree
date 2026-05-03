import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Verifies the on_auth_user_created trigger from migration 0003.
// Service-role admin.createUser sets raw_user_meta_data, which the trigger
// reads to insert the corresponding profiles row.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !URL || !SERVICE;
const describeOrSkip = skip ? describe.skip : describe;

describeOrSkip("auth trigger — profile auto-creation", () => {
  let admin: SupabaseClient;
  const created: string[] = [];

  beforeAll(() => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  });

  afterAll(async () => {
    for (const id of created) await admin.auth.admin.deleteUser(id).catch(() => {});
  });

  it("creates a profile row when username is in user_metadata", async () => {
    const username = `triggertest_${randomUUID().slice(0, 8)}`;
    const { data, error } = await admin.auth.admin.createUser({
      email: `${username}@trigger.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username },
    });
    expect(error).toBeNull();
    if (!data.user) throw new Error("no user returned");
    created.push(data.user.id);

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, username")
      .eq("id", data.user.id)
      .single();
    expect(profileError).toBeNull();
    expect(profile?.username).toBe(username);
  }, 20_000);

  it("rejects signup with a reserved username (rolls back auth.users)", async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: `reservedtest_${randomUUID().slice(0, 8)}@trigger.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username: "admin" }, // reserved
    });
    // Either createUser returns an error, or the auth.users insert succeeds
    // but the trigger raises and rolls back — Supabase Auth surfaces this.
    expect(error).not.toBeNull();
    // If somehow user was created (shouldn't be), clean up.
    if (data?.user) created.push(data.user.id);
  }, 20_000);

  it("skips profile creation when no username metadata (OAuth path)", async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: `nousername_${randomUUID().slice(0, 8)}@trigger.test`,
      password: randomUUID(),
      email_confirm: true,
    });
    expect(error).toBeNull();
    if (!data.user) throw new Error("no user returned");
    created.push(data.user.id);

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    expect(profile).toBeNull();
  }, 20_000);
});
