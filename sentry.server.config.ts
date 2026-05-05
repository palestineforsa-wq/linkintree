import * as Sentry from "@sentry/nextjs";

// Server runtime initialization. Skipped silently when SENTRY_DSN isn't set
// (dev runs and any preview deploy without secrets).
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",
  });
}
