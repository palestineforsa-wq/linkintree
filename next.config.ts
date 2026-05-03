import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  // Public profile cache is per-route via `export const revalidate = 60`
  // in app/[username]/page.tsx. Nginx s-maxage layer ships in MYWEB-12.
};

export default config;
