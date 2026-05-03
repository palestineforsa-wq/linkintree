import { NextResponse, type NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { blocks } from "@/lib/db/schema";
import { blockSchemas } from "@/lib/blocks/schemas";
import { extractRequestContext, isBot, logClick } from "@/lib/analytics/log";

// Click logger + 302. Open-redirect prevention (spec §10): the redirect
// target is read from the database, never from a query string. Only
// link-type blocks redirect; everything else 404s.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;

  const [block] = await db
    .select({
      id: blocks.id,
      profileId: blocks.profileId,
      type: blocks.type,
      isActive: blocks.isActive,
      data: blocks.data,
    })
    .from(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.isActive, true)))
    .limit(1);

  if (!block || block.type !== "link") {
    return new NextResponse("Not found", { status: 404 });
  }

  const parsed = blockSchemas.link.safeParse(block.data);
  if (!parsed.success) {
    return new NextResponse("Invalid block data", { status: 500 });
  }

  // Bot filter — skip the insert but still 302 so search engine bots can
  // follow the link if they need to (spec §8: bots are dropped, not refused).
  const userAgent = req.headers.get("user-agent");
  if (!isBot(userAgent)) {
    const ctx = extractRequestContext(req.headers);
    // Fire and forget. Do NOT await on the redirect path.
    void logClick({
      blockId: block.id,
      profileId: block.profileId,
      ctx,
    });
  }

  return NextResponse.redirect(parsed.data.url, 302);
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
