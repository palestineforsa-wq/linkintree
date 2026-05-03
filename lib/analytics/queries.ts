// Dashboard analytics queries. Anything iterating raw `clicks` for users with
// >100k events MUST go through a materialized view (refreshed every 5 min).
// Don't hit raw clicks directly from a request handler.

export async function topBlocks(_profileId: string, _windowDays: number) {
  // TODO MYWEB-7
  return [] as { blockId: string; clicks: number }[];
}

export async function ctrPerBlock(_profileId: string, _windowDays: number) {
  // TODO MYWEB-7 (Pro)
  return [] as { blockId: string; views: number; clicks: number; ctr: number }[];
}

export async function funnel(_profileId: string, _windowDays: number) {
  // TODO MYWEB-7 (Pro): page_view → first_scroll → first_click → outbound
  return null;
}
