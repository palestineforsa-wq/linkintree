import { NextResponse } from "next/server";
import { listOwnEmailCaptures } from "@/lib/actions/email-capture";

// CSV export. Free tier capped server-side at 25 rows; Pro unlimited.
// requireUser is enforced inside listOwnEmailCaptures.
export async function GET() {
  const { visible } = await listOwnEmailCaptures();
  const header = "email,captured_at\n";
  const body = visible
    .map(
      (r) =>
        `${escapeCsv(r.email)},${r.capturedAt.toISOString()}`,
    )
    .join("\n");
  const csv = header + body + (body ? "\n" : "");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audience-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeCsv(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const dynamic = "force-dynamic";
