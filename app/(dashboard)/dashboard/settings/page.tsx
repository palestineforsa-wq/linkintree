import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { getPlan } from "@/lib/plan/gates";
import { ProfileMetaForm } from "@/components/dashboard/ProfileMetaForm";
import { UpgradeCallout } from "@/components/upgrade/UpgradeCallout";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, plan] = await Promise.all([
    db
      .select({
        username: profiles.username,
        displayName: profiles.displayName,
        bio: profiles.bio,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    getPlan(user.id),
  ]);

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <div className="rounded-lg border bg-background p-5">
          <div className="mb-4 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono">@{profile?.username}</span>
          </div>
          <div className="mb-6 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <ProfileMetaForm
            initialDisplayName={profile?.displayName ?? null}
            initialBio={profile?.bio ?? null}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Plan
        </h2>
        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Current plan</span>
            <span className="font-medium capitalize">
              {plan === "free" ? "Free" : "Pro"}
            </span>
          </div>
          {plan === "free" ? (
            <UpgradeCallout
              className="mt-4"
              size="sm"
              title="Get more from Linkintree"
              description="Pro unlocks unlimited blocks, custom themes, full analytics, and more."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
