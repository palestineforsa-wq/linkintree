import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Linkintree
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        The link-in-bio creators actually convert with. Faster pages, real
        analytics, blocks beyond links.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium hover:bg-accent"
        >
          Pricing
        </Link>
      </div>
    </main>
  );
}
