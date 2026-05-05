import * as Sentry from "@sentry/nextjs";

// Browser-side initialization. NEXT_PUBLIC_SENTRY_DSN so the value is exposed
// to the client bundle. Sample rates are tighter — we don't want to ship a
// monitoring tax to creator pages.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "production",
    enabled: process.env.NODE_ENV === "production",
  });
}
