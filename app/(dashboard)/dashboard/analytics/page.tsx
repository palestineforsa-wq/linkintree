import { requireUser } from "@/lib/auth/server";
import { getPlan } from "@/lib/plan/gates";
import {
  countClicks,
  countPageViews,
  countUniqueVisitors,
  topBlocks,
} from "@/lib/analytics/queries";
import {
  blockSchemas,
  type BlockType,
} from "@/lib/blocks/schemas";
import { BLOCK_REGISTRY } from "@/lib/blocks/registry";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const plan = await getPlan(user.id);

  const [views, clicks, uniques, top] = await Promise.all([
    countPageViews(user.id),
    countClicks(user.id),
    countUniqueVisitors(user.id),
    topBlocks(user.id, 7, 3),
  ]);

  const ctr = views > 0 ? Math.round((clicks / views) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 7 days. {plan === "free" ? "Upgrade for full history, CTR per block, geo, and more." : null}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Views" value={views.toLocaleString()} />
        <Stat label="Unique visitors" value={uniques.toLocaleString()} />
        <Stat label="Clicks" value={clicks.toLocaleString()} />
        <Stat label="CTR" value={`${ctr}%`} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top blocks
        </h2>
        {top.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No clicks yet. Share your page to start collecting data.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {top.map((row) => (
              <li
                key={row.blockId}
                className="flex items-center justify-between rounded-md border bg-background p-3"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {BLOCK_REGISTRY[row.type as BlockType]?.label ?? row.type}
                  </span>
                  <span className="text-sm font-medium">
                    {summarize(row.type as BlockType, row.data)}
                  </span>
                </span>
                <span className="text-sm tabular-nums">
                  {row.clicks.toLocaleString()} clicks
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function summarize(type: BlockType, raw: unknown): string {
  const parsed = blockSchemas[type]?.safeParse(raw);
  if (!parsed?.success) return "—";
  const data = parsed.data as Record<string, unknown>;
  if (typeof data.title === "string") return data.title;
  if (typeof data.headline === "string") return data.headline;
  return type;
}
