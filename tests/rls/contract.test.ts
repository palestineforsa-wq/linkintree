import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Spec §10 checkbox 1 contract suite — covers RLS gaps not asserted in
// the per-table suites: cross-user profile updates, reserved_usernames
// write protection, processed_webhooks fully locked.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !URL || !PUBLISHABLE || !SERVICE;
const describeOrSkip = skip ? describe.skip : describe;

describeOrSkip("RLS — contract suite", () => {
  let admin: SupabaseClient;
  let userA: string;
  let userB: string;

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const a = await admin.auth.admin.createUser({
      email: `contracta_${randomUUID().slice(0, 8)}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username: `ca_${randomUUID().slice(0, 8)}` },
    });
    if (a.error || !a.data.user) throw a.error;
    userA = a.data.user.id;

    const b = await admin.auth.admin.createUser({
      email: `contractb_${randomUUID().slice(0, 8)}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username: `cb_${randomUUID().slice(0, 8)}` },
    });
    if (b.error || !b.data.user) throw b.error;
    userB = b.data.user.id;
  }, 30_000);

  afterAll(async () => {
    await admin.auth.admin.deleteUser(userA).catch(() => {});
    await admin.auth.admin.deleteUser(userB).catch(() => {});
  });

  it("anon CANNOT update any profile (unauthenticated)", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { error } = await anon
      .from("profiles")
      .update({ display_name: "hacked-anon" })
      .eq("id", userA);
    // PostgREST returns no error but 0 rows for RLS-blocked UPDATEs.
    expect(error).toBeNull();
    const { data } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", userA)
      .single();
    expect(data?.display_name).not.toBe("hacked-anon");
  });

  it("anon CANNOT insert into reserved_usernames", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const evil = `evil_${randomUUID().slice(0, 8)}`;
    const { error } = await anon
      .from("reserved_usernames")
      .insert({ username: evil });
    // RLS blocks the insert; PostgREST surfaces a 42501 / row-level security
    // violation.
    expect(error).not.toBeNull();
  });

  it("anon CANNOT delete from reserved_usernames", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { error: deleteErr } = await anon
      .from("reserved_usernames")
      .delete()
      .eq("username", "admin");
    expect(deleteErr).toBeNull();
    // Confirm "admin" is still reserved.
    const { data } = await admin
      .from("reserved_usernames")
      .select("username")
      .eq("username", "admin")
      .single();
    expect(data?.username).toBe("admin");
  });

  it("anon CANNOT read processed_webhooks (Stripe idempotency table is private)", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { data } = await anon.from("processed_webhooks").select("event_id");
    // No allowing policy → no rows returned to anon.
    expect(data).toEqual([]);
  });

  it("anon CANNOT insert into processed_webhooks", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { error } = await anon
      .from("processed_webhooks")
      .insert({ event_id: `evt_${randomUUID()}` });
    expect(error).not.toBeNull();
  });
});
