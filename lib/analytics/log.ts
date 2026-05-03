// Server-side click & page-view logger. Fire-and-forget — the redirect or
// page render is the priority; if logging fails the user still gets through.

import { createHash } from "node:crypto";

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor/i;

export function isBot(userAgent: string | null | undefined) {
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}

// Daily-rotating salt → unique-visitor counts within a day, no cross-day linking.
export function visitorHash(
  ip: string,
  userAgent: string,
  dailySalt: string,
) {
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${dailySalt}`)
    .digest("hex");
}

export type ClickPayload = {
  blockId: string;
  profileId: string;
  referrer: string | null;
  country: string | null;
  device: "mobile" | "tablet" | "desktop" | "bot";
  browser: string | null;
  visitorHash: string;
};

export async function logClick(_p: ClickPayload) {
  // TODO MYWEB-7: insert via service role; never await on the request path.
}

export async function logPageView(
  _p: Omit<ClickPayload, "blockId">,
) {
  // TODO MYWEB-7
}
