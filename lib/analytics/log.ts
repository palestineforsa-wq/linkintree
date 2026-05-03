// Server-side click & page-view logger. Fire-and-forget — the redirect or
// page render is the priority; if logging fails the user still gets through.

import { createHash } from "node:crypto";
import { db } from "@/lib/db/client";
import { clicks, pageViews } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Bot filtering (spec §8: drop before insert to save storage and avoid skew)
// ---------------------------------------------------------------------------
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|fetcher|http-client|headless|phantom|axios|curl|wget|node-fetch|undici/i;

export function isBot(userAgent: string | null | undefined) {
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}

// ---------------------------------------------------------------------------
// Daily-rotating visitor hash (spec §8 privacy: count unique visitors within
// a day, prevent linking across days). Salt = SEED + UTC date string.
// ---------------------------------------------------------------------------
function dailySalt(now = new Date()) {
  const seed = process.env.ANALYTICS_DAILY_SALT_SEED ?? "linkintree-fallback";
  const ymd = now.toISOString().slice(0, 10);
  return `${seed}|${ymd}`;
}

export function visitorHash(ip: string, userAgent: string, now = new Date()) {
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${dailySalt(now)}`)
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Request context — extracts country, device, browser, IP from headers.
// Header preference order:
//   x-vercel-ip-country     (Vercel)
//   cf-ipcountry            (Cloudflare)
//   x-forwarded-for         (any reverse proxy — IP only)
// ---------------------------------------------------------------------------
export type DeviceKind = "mobile" | "tablet" | "desktop" | "bot";

export type RequestContext = {
  userAgent: string;
  ip: string;
  referrer: string | null;
  country: string | null;
  device: DeviceKind;
  browser: string | null;
  visitorHash: string;
};

function detectDevice(ua: string): DeviceKind {
  if (isBot(ua)) return "bot";
  if (/iPad|tablet|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string | null {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg\/|OPR\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return null;
}

export function extractRequestContext(headers: Headers): RequestContext {
  const userAgent = headers.get("user-agent") ?? "";
  const referrer = headers.get("referer") ?? null;
  const country =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    null;

  // First IP in X-Forwarded-For chain is the client.
  const xff = headers.get("x-forwarded-for") ?? "";
  const ip =
    xff.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "0.0.0.0";

  return {
    userAgent,
    ip,
    referrer,
    country: country?.toUpperCase() ?? null,
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    visitorHash: visitorHash(ip, userAgent),
  };
}

// ---------------------------------------------------------------------------
// Inserts. Drizzle direct connection bypasses RLS (postgres role), which is
// what we want for server-only analytics writes (spec §4).
// ---------------------------------------------------------------------------
export async function logClick(input: {
  blockId: string;
  profileId: string;
  ctx: RequestContext;
}) {
  const { blockId, profileId, ctx } = input;
  if (ctx.device === "bot") return; // already filtered at the route, but defense in depth
  try {
    await db.insert(clicks).values({
      blockId,
      profileId,
      referrer: ctx.referrer,
      country: ctx.country,
      device: ctx.device,
      browser: ctx.browser,
      visitorHash: ctx.visitorHash,
    });
  } catch (err) {
    // Never throw on the redirect path.
    console.error("[analytics] logClick failed", err);
  }
}

export async function logPageView(input: {
  profileId: string;
  ctx: RequestContext;
}) {
  const { profileId, ctx } = input;
  if (ctx.device === "bot") return;
  try {
    await db.insert(pageViews).values({
      profileId,
      referrer: ctx.referrer,
      country: ctx.country,
      device: ctx.device,
      browser: ctx.browser,
      visitorHash: ctx.visitorHash,
    });
  } catch (err) {
    console.error("[analytics] logPageView failed", err);
  }
}
