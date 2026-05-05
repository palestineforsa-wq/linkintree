"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import {
  blocks,
  emailCaptures,
  type Block,
} from "@/lib/db/schema";

export type CaptureResult =
  | { ok: true }
  | { ok: false; error: string };

const captureSchema = z.object({
  blockId: z.string().uuid(),
  email: z.string().email().max(254),
});

// In-memory token bucket per IP. Cheap, process-local, clears on restart —
// fine for v1. MYWEB-12 swaps in Upstash if abuse becomes a problem.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

export async function captureEmailAction(
  input: unknown,
): Promise<CaptureResult> {
  const parsed = captureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0";

  if (!rateLimitOk(ip)) {
    return { ok: false, error: "Too many submissions. Try again in a minute." };
  }

  const { blockId, email } = parsed.data;

  // Confirm the block is active and is an email_capture. Bypassing RLS via
  // Drizzle direct is intentional — the public form needs to look up active
  // blocks regardless of viewer auth.
  const [block]: Block[] = await db
    .select()
    .from(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.isActive, true)))
    .limit(1);
  if (!block || block.type !== "email_capture") {
    return { ok: false, error: "This form is no longer accepting submissions." };
  }

  // Unique on (profile_id, email) per migration 0001 — duplicates are a
  // success from the user's POV (their email is on file).
  try {
    await db.insert(emailCaptures).values({
      profileId: block.profileId,
      email,
      sourceBlockId: blockId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (!msg.includes("duplicate") && !msg.includes("23505")) {
      console.error("[email-capture] insert failed", err);
      return { ok: false, error: "Couldn't save your email. Try again." };
    }
  }

  // No revalidate — submissions don't change the public page; audience
  // page is force-dynamic and reads fresh on every dashboard visit.
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Audience listing — owner-only, read via Drizzle direct (gated by requireUser).
// ----------------------------------------------------------------------------
import { requireUser } from "@/lib/auth/server";
import { desc } from "drizzle-orm";
import { LIMITS } from "@/lib/plan/limits";
import { getPlan } from "@/lib/plan/gates";

export async function listOwnEmailCaptures() {
  const user = await requireUser();
  const plan = await getPlan(user.id);
  const limit = LIMITS[plan].emailCapturesExportLimit;

  const rows = await db
    .select({
      email: emailCaptures.email,
      capturedAt: emailCaptures.capturedAt,
    })
    .from(emailCaptures)
    .where(eq(emailCaptures.profileId, user.id))
    .orderBy(desc(emailCaptures.capturedAt));

  return {
    plan,
    rows,
    visible: Number.isFinite(limit) ? rows.slice(0, limit) : rows,
    limit,
  };
}
