import "server-only";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

// Invalidates both the dashboard (so the editor sees fresh data) and the
// public profile page (so visitors see edits within seconds, not the 60s
// revalidate window). Username never changes, so a single lookup is fine.
export async function revalidateOwnerSurfaces(userId: string) {
  const [row] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  revalidatePath("/dashboard");
  if (row) revalidatePath(`/${row.username}`);
}
