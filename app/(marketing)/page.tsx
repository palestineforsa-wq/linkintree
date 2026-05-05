import Link from "next/link";

export const metadata = {
  description:
    "The link-in-bio creators actually convert with. Faster pages, real analytics, blocks beyond links.",
};

const REASONS = [
  {
    title: "Conversion, not just clicks",
    body: "We measure the metric that matters — what fraction of visitors actually click. Not vanity counts.",
  },
  {
    title: "Sub-second on 3G",
    body: "Public pages are server-rendered with near-zero JavaScript. Your bio loads before they swipe away.",
  },
  {
    title: "Blocks beyond links",
    body: "Embed YouTube and Spotify, sell a product, capture emails — all first-class, not afterthoughts.",
  },
  {
    title: "Real analytics",
    body: "CTR per block, geo, devices, referrers, cohorts, funnel. The dashboard creators actually use.",
  },
] as const;

const BLOCK_TYPES = [
  "Link",
  "Header",
  "Socials",
  "Spacer",
  "Embed",
  "Video",
  "Email capture",
  "Product",
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Nav */}
      <nav className="mb-12 flex items-center justify-between">
        <div className="text-lg font-semibold">Linkintree</div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          The link-in-bio creators actually convert with.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Faster pages. Real analytics. Blocks beyond links. Free forever, with
          everything you need.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Claim your username
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center rounded-md border px-6 text-sm font-medium hover:bg-accent"
          >
            See pricing
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No credit card. No nag screens.
        </p>
      </section>

      {/* Why */}
      <section className="mt-24">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Why creators switch
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="rounded-lg border bg-background p-6"
            >
              <h3 className="text-base font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Block types showcase */}
      <section className="mt-24">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Eight block types
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground">
          Adding a new type takes us a folder, not a refactor. The same goes
          for what shows up on your page.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {BLOCK_TYPES.map((b) => (
            <span
              key={b}
              className="rounded-full border bg-background px-3 py-1.5 text-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-2xl border bg-primary/5 p-8 text-center">
        <h2 className="text-2xl font-semibold">Ship a page in a minute.</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Pick a username, drop in your links, share the URL. The conversion
          gain is the easy part.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Start free
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-24 flex items-center justify-between border-t pt-8 text-xs text-muted-foreground">
        <span>© Linkintree</span>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
