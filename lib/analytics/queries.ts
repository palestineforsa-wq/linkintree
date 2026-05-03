import "server-only";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blocks, clicks, pageViews } from "@/lib/db/schema";

// Free-tier dashboard queries (last 7d). Pro tier (CTR, funnel, geo, cohort,
// referrers, devices) lands in MYWEB-9 alongside plan gating. Spec §8 calls
// for materialized views once a profile crosses ~100k events; for now these
// hit raw tables, indexed by (profile_id, occurred_at DESC).

const SEVEN_DAYS = 7;

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------
export async function countPageViews(profileId: string, days = SEVEN_DAYS) {
  const since = daysAgo(days);
  const [row] = await db
    .select({ value: count() })
    .from(pageViews)
    .where(
      and(
        eq(pageViews.profileId, profileId),
        gte(pageViews.occurredAt, since),
      ),
    );
  return row?.value ?? 0;
}

export async function countClicks(profileId: string, days = SEVEN_DAYS) {
  const since = daysAgo(days);
  const [row] = await db
    .select({ value: count() })
    .from(clicks)
    .where(
      and(eq(clicks.profileId, profileId), gte(clicks.occurredAt, since)),
    );
  return row?.value ?? 0;
}

export async function countUniqueVisitors(
  profileId: string,
  days = SEVEN_DAYS,
) {
  const since = daysAgo(days);
  const [row] = await db
    .select({
      value: sql<number>`count(distinct ${pageViews.visitorHash})::int`,
    })
    .from(pageViews)
    .where(
      and(
        eq(pageViews.profileId, profileId),
        gte(pageViews.occurredAt, since),
      ),
    );
  return row?.value ?? 0;
}

// ---------------------------------------------------------------------------
// Top blocks (joined with the block to get its title)
// ---------------------------------------------------------------------------
export async function topBlocks(
  profileId: string,
  days = SEVEN_DAYS,
  limit = 3,
) {
  const since = daysAgo(days);
  const rows = await db
    .select({
      blockId: blocks.id,
      type: blocks.type,
      data: blocks.data,
      clicks: count(clicks.id),
    })
    .from(clicks)
    .innerJoin(blocks, eq(blocks.id, clicks.blockId))
    .where(
      and(eq(clicks.profileId, profileId), gte(clicks.occurredAt, since)),
    )
    .groupBy(blocks.id)
    .orderBy(desc(count(clicks.id)))
    .limit(limit);
  return rows;
}

// ---------------------------------------------------------------------------
// Pro-tier stubs — will be filled in MYWEB-10. Kept here so the dashboard
// can import without breaking when the plan unlocks them.
// ---------------------------------------------------------------------------
export async function ctrPerBlock(_profileId: string, _days = SEVEN_DAYS) {
  // TODO MYWEB-10: clicks / page_views per block
  return [] as { blockId: string; views: number; clicks: number; ctr: number }[];
}

export async function funnel(_profileId: string, _days = SEVEN_DAYS) {
  // TODO MYWEB-10: page_view → first_scroll → first_click → outbound
  return null;
}
