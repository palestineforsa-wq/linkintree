import { NextResponse, type NextRequest } from "next/server";

// MYWEB-7: log + 302. Open-redirect prevention: only redirect to URL stored
// in the block, never to a query-string-supplied URL.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId: _blockId } = await params;

  // TODO: load block by id, validate type === 'link' and is_active === true
  // TODO: enqueue fire-and-forget click log (lib/analytics/log.ts)
  const target = "/"; // stored URL only

  return NextResponse.redirect(new URL(target, req.url), 302);
}
