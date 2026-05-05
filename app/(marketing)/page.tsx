import Link from "next/link";
import { ArrowRight, BarChart3, Layers, Sparkles, Zap } from "lucide-react";

export const metadata = {
  description:
    "The link-in-bio creators actually convert with. Faster pages, real analytics, blocks beyond links.",
};

const REASONS = [
  {
    icon: BarChart3,
    title: "Conversion, not clicks",
    body: "We surface CTR per block — the metric that moves revenue. Not vanity counts.",
  },
  {
    icon: Zap,
    title: "Sub-second on 3G",
    body: "Pages are server-rendered with near-zero JavaScript. Loads before they swipe.",
  },
  {
    icon: Layers,
    title: "Blocks, not just links",
    body: "Embed YouTube, sell a product, capture emails — first-class, not afterthoughts.",
  },
  {
    icon: Sparkles,
    title: "Liquid Glass theme",
    body: "Apple-grade visual polish out of the box. Looks brand-new on day one.",
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
    <div className="relative">
      <Nav />
      <Hero />
      <Reasons />
      <BlockShowcase />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
      <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
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
          href="/pricing"
          className="hidden rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground sm:inline-flex"
        >
          Pricing
        </Link>
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
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center sm:pt-32">
      <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Free forever — no credit card
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
        The link-in-bio creators
        <br className="hidden sm:block" />{" "}
        <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
          actually convert with.
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
        Faster pages. Real analytics. Blocks beyond links. Looks brand-new on day one.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="group inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground px-7 text-sm font-medium text-background transition hover:opacity-95 sm:w-auto"
        >
          Claim your username
          <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-12 w-full items-center justify-center rounded-full glass-button px-6 text-sm font-medium hover:bg-white/15 sm:w-auto"
        >
          See pricing
        </Link>
      </div>
      <ProfilePreview />
    </section>
  );
}

function ProfilePreview() {
  return (
    <div className="relative mx-auto mt-20 w-full max-w-sm">
      <div className="absolute -inset-x-12 -inset-y-8 -z-10 rounded-[3rem] bg-gradient-to-tr from-fuchsia-500/20 via-violet-500/20 to-sky-500/20 blur-3xl" />
      <div className="rounded-3xl glass-strong p-6 text-left">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500" />
          <div className="mt-3 text-base font-semibold">Sofia Reyes</div>
          <div className="text-xs text-muted-foreground">@sofia</div>
        </div>
        <ul className="mt-6 flex flex-col gap-2.5">
          {[
            "Latest essay — Why I quit",
            "Book a 15-min coffee chat",
            "Watch the new video",
            "Sponsor my newsletter",
          ].map((label) => (
            <li
              key={label}
              className="rounded-2xl glass-button px-4 py-3 text-center text-sm font-medium"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Reasons() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Why creators switch
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-balance text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        Built for the metric that pays you.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {REASONS.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl glass p-6 transition hover:translate-y-[-2px]"
          >
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl glass-button"
            >
              <r.icon className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{r.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockShowcase() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Eight block types
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-balance text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Adding a new type takes us a folder, not a refactor.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {BLOCK_TYPES.map((b) => (
          <span
            key={b}
            className="rounded-full glass-button px-4 py-2 text-sm"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl glass-strong p-10 text-center sm:p-14">
        <div className="absolute -top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-sky-500/30 opacity-40 blur-3xl" />
        <div className="relative">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Ship your page in a minute.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Pick a username. Drop your links. Share the URL. The conversion gain
            is the easy part.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition hover:opacity-95"
          >
            Start free
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 pb-12 pt-8 text-xs text-muted-foreground sm:flex-row">
      <span>© Linkintree</span>
      <div className="flex gap-5">
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
  );
}
