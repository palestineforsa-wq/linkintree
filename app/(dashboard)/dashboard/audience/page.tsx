import { listOwnEmailCaptures } from "@/lib/actions/email-capture";
import { UpgradeCallout } from "@/components/upgrade/UpgradeCallout";

export const metadata = { title: "Audience" };
export const dynamic = "force-dynamic";

export default async function AudiencePage() {
  const { plan, rows, visible, limit } = await listOwnEmailCaptures();
  const total = rows.length;
  const cappedFree =
    plan === "free" && total > visible.length;

  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audience</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? "Email captures from your email_capture blocks land here."
              : `${total.toLocaleString()} email${total === 1 ? "" : "s"} captured.`}
          </p>
        </div>
        {visible.length > 0 ? (
          // Plain <a> on purpose: <Link> does client-side navigation, which
          // would not trigger a CSV download for the API route.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/api/audience/export"
            className="inline-flex h-10 items-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Export CSV{plan === "free" ? ` (first ${limit})` : ""}
          </a>
        ) : null}
      </header>

      {visible.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No captures yet. Add an Email capture block to your page.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Captured</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.email} className="border-t">
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.capturedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cappedFree ? (
        <UpgradeCallout
          className="mt-6"
          title={`Free tier shows the first ${limit} captures`}
          description={`You have ${total.toLocaleString()} total. Upgrade to see and export all of them.`}
          reason="Unlimited audience export is a Pro feature."
        />
      ) : null}
    </div>
  );
}
