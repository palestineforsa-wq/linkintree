"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { profiles, reservedUsernames } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  usernameSchema,
} from "@/lib/auth/schemas";
import { getSiteUrl } from "@/lib/site";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; field?: string };

const SITE_URL = getSiteUrl();

// --- username availability ---------------------------------------------------

export async function checkUsernameAvailability(
  rawUsername: string,
): Promise<ActionResult<{ available: boolean; reason?: string }>> {
  const parsed = usernameSchema.safeParse(rawUsername);
  if (!parsed.success) {
    return {
      ok: true,
      data: {
        available: false,
        reason: parsed.error.issues[0]?.message ?? "Invalid username.",
      },
    };
  }

  const username = parsed.data;

  const [reserved] = await db
    .select({ username: reservedUsernames.username })
    .from(reservedUsernames)
    .where(eq(reservedUsernames.username, username))
    .limit(1);
  if (reserved) {
    return { ok: true, data: { available: false, reason: "Reserved." } };
  }

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);
  if (existing) {
    return { ok: true, data: { available: false, reason: "Taken." } };
  }

  return { ok: true, data: { available: true } };
}

// --- signup ------------------------------------------------------------------

export async function signupAction(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid input.",
      field: typeof first?.path[0] === "string" ? first.path[0] : undefined,
    };
  }

  const { email, password, username } = parsed.data;

  // Pre-check for friendly UX. The DB trigger + unique constraint are the real
  // safety net — server actions never trust the client and re-check here too.
  const availability = await checkUsernameAvailability(username);
  if (!availability.ok) {
    return { ok: false, error: availability.error, field: "username" };
  }
  if (!availability.data?.available) {
    return {
      ok: false,
      error: availability.data?.reason ?? "Username unavailable.",
      field: "username",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${SITE_URL}/callback?next=/dashboard`,
    },
  });

  if (error) {
    // Trigger raised P0001 (username_reserved) or unique violation on race.
    if (error.message.includes("username_reserved")) {
      return { ok: false, error: "Reserved.", field: "username" };
    }
    if (
      error.message.includes("duplicate key") ||
      error.message.includes("23505")
    ) {
      return { ok: false, error: "Taken.", field: "username" };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// --- login -------------------------------------------------------------------

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true };
}

// --- logout ------------------------------------------------------------------

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// --- password reset ----------------------------------------------------------

export async function requestPasswordResetAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${SITE_URL}/callback?next=/dashboard/settings` },
  );
  // Whether the email exists or not, return ok — don't leak account existence.
  if (error) {
    console.error("[password reset]", error);
  }
  return { ok: true };
}
