import { describe, expect, it } from "vitest";
import { FREE_LIMITS, PRO_LIMITS } from "@/lib/plan/limits";
import { blockSchemas, FREE_BLOCK_TYPES } from "@/lib/blocks/schemas";

describe("plan limits", () => {
  it("free plan caps active blocks at 5", () => {
    expect(FREE_LIMITS.activeBlocks).toBe(5);
  });

  it("pro plan has no block cap", () => {
    expect(PRO_LIMITS.activeBlocks).toBe(Number.POSITIVE_INFINITY);
  });

  it("free plan only allows 4 basic block types", () => {
    expect(FREE_BLOCK_TYPES).toHaveLength(4);
    expect(FREE_BLOCK_TYPES).toEqual(
      expect.arrayContaining(["link", "header", "social_row", "spacer"]),
    );
  });
});

describe("block schemas", () => {
  it("rejects link blocks without a URL", () => {
    const result = blockSchemas.link.safeParse({ title: "x" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid link block", () => {
    const result = blockSchemas.link.safeParse({
      title: "My site",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });
});
