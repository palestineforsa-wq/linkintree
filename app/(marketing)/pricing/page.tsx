import Link from "next/link";
import { Check, Lock } from "lucide-react";

export const metadata = { title: "Pricing" };

type Row = { label: string; free: string | true | false; pro: string | true | false };

const ROWS: Row[] = [
  { label: "Active blocks", free: "5", pro: "Unlimited" },
  { label: "Block types", free: "Basic 4", pro: "All 8" },
  { label: "Themes", free: "4 presets", pro: "Full editor" },
  { label: "Custom CSS", free: false, pro: true },
  { label: "Custom OG image", free: false, pro: true },
  { label: "Block scheduling", free: false, pro: true },
  { label: "Verified badge", free: false, pro: "Manual review" },
  { label: '"Powered by" footer', free: "Shown", pro: "Hidden" },
  {
    label: "Analytics",
    free: "Last 7 days, basic counts",
    pro: "Full history, CTR, funnel, geo, devices, referrers, cohorts",
  },
  { label: "Email capture exports", free: "First 25", pro: "Unlimited CSV" },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Free forever. Pro when you need it.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start with everything a creator needs. Upgrade for the analytics that
          actually move conversions.
        </p>
      </header>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          period="forever"
          ctaHref="/signup"
          ctaLabel="Get started"
          highlight={false}
        />
        <PlanCard
          name="Pro"
          price="Coming soon"
          period="$ TBD"
          ctaHref="/signup"
          ctaLabel="Join the waitlist"
          highlight
        />
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Compare features
        </h2>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Feature</th>
                <th className="px-4 py-3 text-left font-medium">Free</th>
                <th className="px-4 py-3 text-left font-medium">Pro</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3">
                    <Cell value={row.free} />
                  </td>
                  <td className="px-4 py-3">
                    <Cell value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Pro is in development — pricing and billing launch soon. Sign up for
        free today; your existing data carries over.
      </p>
    </main>
  );
}

function Cell({ value }: { value: Row["free"] }) {
  if (value === true)
    return <Check className="h-4 w-4 text-emerald-600" aria-label="Yes" />;
  if (value === false)
    return <Lock className="h-4 w-4 text-muted-foreground" aria-label="No" />;
  return <span>{value}</span>;
}

function PlanCard({
  name,
  price,
  period,
  ctaHref,
  ctaLabel,
  highlight,
}: {
  name: string;
  price: string;
  period: string;
  ctaHref: "/signup" | "/login";
  ctaLabel: string;
  highlight: boolean;
}) {
  return (
    <div
      className={
        "relative rounded-xl border p-6 " +
        (highlight ? "border-primary bg-primary/5" : "bg-background")
      }
    >
      {highlight ? (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Coming soon
        </span>
      ) : null}
      <div className="text-sm font-semibold uppercase tracking-wider">
        {name}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
