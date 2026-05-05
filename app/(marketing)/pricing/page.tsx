import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";

export const metadata = { title: "Pricing" };

type Row = {
  label: string;
  free: string | true | false;
  pro: string | true | false;
};

const ROWS: Row[] = [
  { label: "Active blocks", free: "5", pro: "Unlimited" },
  { label: "Block types", free: "Basic 4", pro: "All 8" },
  { label: "Themes", free: "5 presets", pro: "Full editor" },
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
    <div className="relative">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Pricing
          </span>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Free forever.
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              Pro when you need it.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
            Start with everything a creator needs. Upgrade for the analytics
            that actually move conversions.
          </p>
        </header>

        <section className="mt-14 grid gap-5 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            period="forever"
            ctaHref="/signup"
            ctaLabel="Get started"
            highlight={false}
            features={[
              "Up to 5 active blocks",
              "4 basic block types",
              "5 theme presets including Liquid Glass",
              "Last-7-days analytics",
              "First 25 email captures",
            ]}
          />
          <PlanCard
            name="Pro"
            price="Coming soon"
            period="$ TBD"
            ctaHref="/signup"
            ctaLabel="Join the waitlist"
            highlight
            features={[
              "Unlimited blocks",
              "All 8 block types — embed, video, email capture, product",
              "Full theme editor + custom CSS",
              "Full analytics: CTR, funnel, geo, cohorts",
              "Block scheduling, custom OG, verified badge",
            ]}
          />
        </section>

        <section className="mt-20">
          <h2 className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Compare features
          </h2>
          <div className="overflow-hidden rounded-2xl glass">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">
                    Free
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-white/5">
                    <td className="px-5 py-3.5">{row.label}</td>
                    <td className="px-5 py-3.5">
                      <Cell value={row.free} />
                    </td>
                    <td className="px-5 py-3.5">
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
    </div>
  );
}

function Nav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold tracking-tight"
      >
        <span
          aria-hidden
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg glass-button"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        Linkintree
      </Link>
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/login"
          className="hidden rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground sm:inline-flex"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-9 items-center rounded-full glass-button px-4 text-sm font-medium hover:bg-white/15"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}

function Cell({ value }: { value: Row["free"] }) {
  if (value === true)
    return <Check className="h-4 w-4 text-emerald-400" aria-label="Yes" />;
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
  features,
}: {
  name: string;
  price: string;
  period: string;
  ctaHref: "/signup" | "/login";
  ctaLabel: string;
  highlight: boolean;
  features: readonly string[];
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-3xl p-7 " +
        (highlight ? "glass-strong" : "glass")
      }
    >
      {highlight ? (
        <>
          <div className="absolute -top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-sky-500/20 blur-3xl" />
          <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
            Coming soon
          </span>
        </>
      ) : null}
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {name}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        <Link
          href={ctaHref}
          className={
            "mt-7 inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium transition " +
            (highlight
              ? "bg-foreground text-background hover:opacity-95"
              : "glass-button hover:bg-white/15")
          }
        >
          {ctaLabel}
        </Link>
        <ul className="mt-6 flex flex-col gap-2.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-foreground/90">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
