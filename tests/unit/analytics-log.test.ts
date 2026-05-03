import { beforeAll, describe, expect, it } from "vitest";
import {
  extractRequestContext,
  isBot,
  visitorHash,
} from "@/lib/analytics/log";

beforeAll(() => {
  // Stable seed so the visitor-hash assertions don't depend on env load order.
  process.env.ANALYTICS_DAILY_SALT_SEED = "test-seed";
});

describe("isBot", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "WhatsApp/2.21",
    "curl/8.4.0",
    "node-fetch/3.0",
    "axios/1.6.0",
  ])("flags bot UA: %s", (ua) => {
    expect(isBot(ua)).toBe(true);
  });

  it.each([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  ])("does not flag real browser: %s", (ua) => {
    expect(isBot(ua)).toBe(false);
  });

  it("flags missing UA as bot", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
    expect(isBot("")).toBe(true);
  });
});

describe("visitorHash", () => {
  it("is deterministic within a day", () => {
    const day = new Date("2026-05-04T12:00:00Z");
    const a = visitorHash("1.2.3.4", "ua", day);
    const b = visitorHash("1.2.3.4", "ua", new Date("2026-05-04T23:59:59Z"));
    expect(a).toBe(b);
  });

  it("differs across days for the same visitor (privacy)", () => {
    const a = visitorHash("1.2.3.4", "ua", new Date("2026-05-04T00:00:00Z"));
    const b = visitorHash("1.2.3.4", "ua", new Date("2026-05-05T00:00:00Z"));
    expect(a).not.toBe(b);
  });

  it("differs by IP", () => {
    const day = new Date();
    expect(visitorHash("1.2.3.4", "ua", day)).not.toBe(
      visitorHash("5.6.7.8", "ua", day),
    );
  });
});

describe("extractRequestContext", () => {
  function build(headers: Record<string, string>): Headers {
    const h = new Headers();
    for (const [k, v] of Object.entries(headers)) h.set(k, v);
    return h;
  }

  it("prefers x-vercel-ip-country", () => {
    const ctx = extractRequestContext(
      build({
        "x-vercel-ip-country": "DE",
        "cf-ipcountry": "FR",
        "user-agent": "Mozilla/5.0 Chrome/120",
      }),
    );
    expect(ctx.country).toBe("DE");
  });

  it("falls back to cf-ipcountry", () => {
    const ctx = extractRequestContext(
      build({
        "cf-ipcountry": "fr",
        "user-agent": "Mozilla/5.0 Chrome/120",
      }),
    );
    expect(ctx.country).toBe("FR");
  });

  it("returns null country when no headers", () => {
    const ctx = extractRequestContext(build({ "user-agent": "x" }));
    expect(ctx.country).toBeNull();
  });

  it("classifies device by UA", () => {
    expect(
      extractRequestContext(build({ "user-agent": "iPhone Safari" })).device,
    ).toBe("mobile");
    expect(
      extractRequestContext(build({ "user-agent": "iPad Safari" })).device,
    ).toBe("tablet");
    expect(
      extractRequestContext(build({ "user-agent": "Chrome/120 Windows" }))
        .device,
    ).toBe("desktop");
    expect(
      extractRequestContext(build({ "user-agent": "Googlebot" })).device,
    ).toBe("bot");
  });

  it("detects browser family", () => {
    const get = (ua: string) =>
      extractRequestContext(build({ "user-agent": ua })).browser;
    expect(get("Chrome/120 Safari/537")).toBe("Chrome");
    expect(get("Firefox/120")).toBe("Firefox");
    expect(get("Safari/605 Version/17")).toBe("Safari");
    expect(get("Edg/120")).toBe("Edge");
  });

  it("uses first IP from x-forwarded-for chain", () => {
    const ctx = extractRequestContext(
      build({
        "x-forwarded-for": "203.0.113.5, 10.0.0.1, 192.168.1.1",
        "user-agent": "Chrome/120",
      }),
    );
    expect(ctx.ip).toBe("203.0.113.5");
  });
});
