import { describe, expect, it } from "vitest";
import { LIMITS, FREE_LIMITS, PRO_LIMITS } from "@/lib/plan/limits";

// Plan limits are the contract everything else (server actions, pricing
// page, upgrade callouts) reads from. If these drift, the pricing table
// in /pricing and the gates in lib/plan/gates.ts go out of sync.

describe("plan limits contract", () => {
  it("free vs pro have meaningful differences across every locked dimension", () => {
    expect(FREE_LIMITS.activeBlocks).toBeLessThan(PRO_LIMITS.activeBlocks);
    expect(FREE_LIMITS.themePresetsOnly).toBe(true);
    expect(PRO_LIMITS.themePresetsOnly).toBe(false);
    expect(FREE_LIMITS.customCss).toBe(false);
    expect(PRO_LIMITS.customCss).toBe(true);
    expect(FREE_LIMITS.poweredByFooter).toBe(true);
    expect(PRO_LIMITS.poweredByFooter).toBe(false);
    expect(FREE_LIMITS.blockScheduling).toBe(false);
    expect(PRO_LIMITS.blockScheduling).toBe(true);
    expect(FREE_LIMITS.customOgImage).toBe(false);
    expect(PRO_LIMITS.customOgImage).toBe(true);
    expect(FREE_LIMITS.verifiedBadgeEligible).toBe(false);
    expect(PRO_LIMITS.verifiedBadgeEligible).toBe(true);
    expect(FREE_LIMITS.analyticsHistoryDays).toBeLessThan(
      PRO_LIMITS.analyticsHistoryDays,
    );
    expect(FREE_LIMITS.emailCapturesExportLimit).toBeLessThan(
      PRO_LIMITS.emailCapturesExportLimit,
    );
  });

  it("LIMITS lookup covers free, pro, pro_yearly", () => {
    expect(LIMITS.free).toBe(FREE_LIMITS);
    expect(LIMITS.pro).toBe(PRO_LIMITS);
    expect(LIMITS.pro_yearly).toBe(PRO_LIMITS);
  });

  it("free block types are a subset of all 8", () => {
    const free = FREE_LIMITS.blockTypes;
    expect(free).not.toBe("all");
    expect(Array.isArray(free)).toBe(true);
    if (Array.isArray(free)) expect(free.length).toBe(4);
  });

  it("pro block types covers all (sentinel)", () => {
    expect(PRO_LIMITS.blockTypes).toBe("all");
  });
});
