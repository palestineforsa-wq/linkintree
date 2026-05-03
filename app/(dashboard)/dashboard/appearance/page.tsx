import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { resolveProfileTheme } from "@/lib/themes/schema";
import { ThemePicker } from "@/components/appearance/ThemePicker";
import { UpgradeCallout } from "@/components/upgrade/UpgradeCallout";
import { getPlan } from "@/lib/plan/gates";

export const metadata = { title: "Appearance" };
export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const user = await requireUser();
  const [profile, plan] = await Promise.all([
    db
      .select({ theme: profiles.theme })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    getPlan(user.id),
  ]);

  const theme = resolveProfileTheme(profile?.theme);

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Appearance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a preset to theme your public page. Saves automatically.
        </p>
      </header>

      <ThemePicker current={theme.preset} />

      {plan === "free" ? (
        <UpgradeCallout
          className="mt-8"
          title="Custom theme editor"
          description="Build your own color palette, font, and button style with Pro."
          reason="Custom theme editor unlocks with Pro."
        />
      ) : null}
    </div>
  );
}
