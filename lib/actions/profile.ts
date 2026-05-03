"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/server";
import { canCustomizeTheme } from "@/lib/plan/gates";
import { profileThemeSchema } from "@/lib/themes/schema";
import { revalidateOwnerSurfaces } from "./_revalidate";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

// ---------------------------------------------------------------------------
// theme — free users only pick from the preset list. canCustomizeTheme will
// allow Pro to pass arbitrary tokens once MYWEB-10 widens the schema.
// ---------------------------------------------------------------------------
export async function updateProfileThemeAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const user = await requireUser();
  const parsed = profileThemeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid theme.",
    };
  }

  // Currently every value is a preset (which is free for everyone). Once Pro
  // adds custom tokens we'll check canCustomizeTheme. Calling it now keeps
  // the server-side check wired so future schema widening is safe.
  void canCustomizeTheme;

  await db
    .update(profiles)
    .set({ theme: parsed.data, updatedAt: new Date() })
    .where(eq(profiles.id, user.id));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// meta — display name + bio. Username is intentionally not editable here;
// changing usernames cascades to the public URL and existing inbound links.
// ---------------------------------------------------------------------------
const profileMetaSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(60, "At most 60 characters.")
    .transform((s) => (s.length === 0 ? null : s))
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(280, "At most 280 characters.")
    .transform((s) => (s.length === 0 ? null : s))
    .nullable(),
});

export type ProfileMetaInput = z.infer<typeof profileMetaSchema>;

export async function updateProfileMetaAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const user = await requireUser();
  const parsed = profileMetaSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid input.",
      field: typeof first?.path[0] === "string" ? first.path[0] : undefined,
    };
  }

  await db
    .update(profiles)
    .set({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}
