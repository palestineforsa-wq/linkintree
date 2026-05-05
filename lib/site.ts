// Resolves the canonical site URL for metadata, OAuth redirects, etc.
// Order of preference:
//   1. NEXT_PUBLIC_SITE_URL when set AND parses as a valid URL
//   2. Vercel's auto-injected VERCEL_PROJECT_PRODUCTION_URL (production)
//   3. Vercel's per-deployment VERCEL_URL (preview)
//   4. Localhost fallback for dev
//
// Defensive on (1) so a typo or unsubstituted placeholder in the env var
// doesn't crash the build (which it did on the first Vercel deploy when
// "<your-vercel-url>.vercel.app" was pasted literally).

const FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      return new URL(raw).toString().replace(/\/$/, "");
    } catch {
      // fall through to Vercel detection
    }
  }
  const prodHost =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodHost) return `https://${prodHost}`;

  const previewHost =
    process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (previewHost) return `https://${previewHost}`;

  return FALLBACK;
}
