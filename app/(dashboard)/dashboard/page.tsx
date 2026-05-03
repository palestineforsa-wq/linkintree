import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { blocks, profiles } from "@/lib/db/schema";
import { getPlan } from "@/lib/plan/gates";
import { DashboardEditor } from "@/components/editor/Editor";
import type { EditorBlock } from "@/components/editor/BlockList";
import type { BlockType } from "@/lib/blocks/schemas";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [profile, ownBlocks, plan] = await Promise.all([
    db
      .select({
        username: profiles.username,
        displayName: profiles.displayName,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(blocks)
      .where(eq(blocks.profileId, user.id))
      .orderBy(blocks.position),
    getPlan(user.id),
  ]);

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile is being set up. Refresh in a moment.
        </p>
      </div>
    );
  }

  const editorBlocks: EditorBlock[] = ownBlocks.map((b) => ({
    id: b.id,
    type: b.type as BlockType,
    data: b.data,
    isActive: b.isActive,
    position: b.position,
  }));

  return (
    <div>
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your blocks</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Toggle Active to publish. Edits autosave.
          </p>
        </div>
        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          View public page →
        </a>
      </header>
      <DashboardEditor
        initialBlocks={editorBlocks}
        username={profile.username}
        displayName={profile.displayName}
        isPro={plan !== "free"}
      />
    </div>
  );
}
