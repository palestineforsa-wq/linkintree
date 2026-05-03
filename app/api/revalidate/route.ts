import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

// Internal cache purge. Hit on profile/block change to bust the public page cache.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const { tag } = (await req.json()) as { tag?: string };
  if (!tag) return NextResponse.json({ ok: false }, { status: 400 });

  revalidateTag(tag);
  return NextResponse.json({ ok: true, tag });
}
