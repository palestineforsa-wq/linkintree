import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
    after: true, // enables `unstable_after` in /[username] for fire-and-forget page-view logs
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  // Public profile cache is per-route via `export const revalidate = 60`
  // in app/[username]/page.tsx. Vercel's Edge Cache layer handles the
  // s-maxage/stale-while-revalidate behavior spec §3 wanted from Nginx.
};

// Sentry build plugin uploads source maps + tunnels CSP'd telemetry. Only
// engages when SENTRY_AUTH_TOKEN is configured (production deploy), so dev
// builds stay fast.
const sentryBuildEnabled =
  Boolean(process.env.SENTRY_AUTH_TOKEN) &&
  Boolean(process.env.SENTRY_ORG) &&
  Boolean(process.env.SENTRY_PROJECT);

export default sentryBuildEnabled
  ? withSentryConfig(config, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    })
  : config;
