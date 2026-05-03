import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Spec §10: clicks/page_views are owner-read only. This suite confirms the
// RLS policy is in place; the dashboard's own queries run via Drizzle direct
// (postgres role bypass) which we filter by user.id at the app level.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const skip = !URL || !PUBLISHABLE || !SERVICE;
const describeOrSkip = skip ? describe.skip : describe;

describeOrSkip("RLS — analytics isolation", () => {
  let admin: SupabaseClient;
  let userId: string;
  let blockId: string;
  let cleanup: string[] = [];

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const u = await admin.auth.admin.createUser({
      email: `analytics_${randomUUID().slice(0, 8)}@rls.test`,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: { username: `a_${randomUUID().slice(0, 8)}` },
    });
    if (u.error || !u.data.user) throw u.error;
    userId = u.data.user.id;
    cleanup.push(userId);

    const { data: blk } = await admin
      .from("blocks")
      .insert({
        profile_id: userId,
        type: "link",
        position: 0,
        is_active: true,
        data: { title: "ok", url: "https://example.com" },
      })
      .select("id")
      .single()
      .throwOnError();
    blockId = blk!.id;

    // Insert two clicks + one page view via service role.
    await admin
      .from("clicks")
      .insert([
        { block_id: blockId, profile_id: userId, visitor_hash: "v1" },
        { block_id: blockId, profile_id: userId, visitor_hash: "v2" },
      ])
      .throwOnError();
    await admin
      .from("page_views")
      .insert({ profile_id: userId, visitor_hash: "v1" })
      .throwOnError();
  }, 30_000);

  afterAll(async () => {
    for (const id of cleanup) await admin.auth.admin.deleteUser(id).catch(() => {});
  });

  it("anon CANNOT read clicks", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { data } = await anon
      .from("clicks")
      .select("id")
      .eq("profile_id", userId);
    expect(data).toEqual([]);
  });

  it("anon CANNOT read page_views", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { data } = await anon
      .from("page_views")
      .select("id")
      .eq("profile_id", userId);
    expect(data).toEqual([]);
  });

  it("anon CANNOT insert a click on behalf of another user", async () => {
    const anon = createClient(URL!, PUBLISHABLE!);
    const { error } = await anon.from("clicks").insert({
      block_id: blockId,
      profile_id: userId,
      visitor_hash: "spoofed",
    });
    // PostgREST returns an RLS-violation error on INSERT with no allowing policy.
    expect(error).not.toBeNull();
  });

  it("service-role admin CAN read (used by dashboard via Drizzle direct)", async () => {
    const { data } = await admin
      .from("clicks")
      .select("id")
      .eq("profile_id", userId);
    expect((data ?? []).length).toBe(2);
  });
});
