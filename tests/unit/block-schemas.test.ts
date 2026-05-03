import { describe, expect, it } from "vitest";
import { blockSchemas } from "@/lib/blocks/schemas";
import { BLOCK_REGISTRY } from "@/lib/blocks/registry";

describe("block registry defaults parse against their own schemas", () => {
  for (const [type, meta] of Object.entries(BLOCK_REGISTRY)) {
    it(`${type} default data is valid`, () => {
      const result = blockSchemas[type as keyof typeof blockSchemas].safeParse(
        meta.defaultData,
      );
      expect(result.success).toBe(true);
    });
  }
});

describe("link block validation", () => {
  it("requires non-empty title", () => {
    expect(
      blockSchemas.link.safeParse({ title: "", url: "https://x.com" }).success,
    ).toBe(false);
  });
  it("requires url", () => {
    expect(blockSchemas.link.safeParse({ title: "ok" }).success).toBe(false);
  });
  it("rejects non-http url", () => {
    expect(
      blockSchemas.link.safeParse({ title: "ok", url: "not a url" }).success,
    ).toBe(false);
  });
  it("accepts optional thumbnail and badge", () => {
    expect(
      blockSchemas.link.safeParse({
        title: "T",
        url: "https://x.com",
        thumbnail_url: "https://img.example/x.png",
        badge: "popular",
      }).success,
    ).toBe(true);
  });
});

describe("social_row block validation", () => {
  it("requires at least one link", () => {
    expect(blockSchemas.social_row.safeParse({ links: [] }).success).toBe(
      false,
    );
  });
  it("caps at 12 links", () => {
    const links = Array.from({ length: 13 }, () => ({
      platform: "x" as const,
      url: "https://x.com",
    }));
    expect(blockSchemas.social_row.safeParse({ links }).success).toBe(false);
  });
  it("rejects unknown platform", () => {
    expect(
      blockSchemas.social_row.safeParse({
        links: [{ platform: "myspace", url: "https://x.com" }],
      }).success,
    ).toBe(false);
  });
});

describe("spacer block validation", () => {
  it("defaults height to md", () => {
    const result = blockSchemas.spacer.safeParse({});
    expect(result.success).toBe(true);
    expect(result.success && result.data.height).toBe("md");
  });
  it("rejects unknown height", () => {
    expect(
      blockSchemas.spacer.safeParse({ height: "xxl" }).success,
    ).toBe(false);
  });
});

describe("header block validation", () => {
  it("requires non-empty title", () => {
    expect(blockSchemas.header.safeParse({ title: "" }).success).toBe(false);
  });
  it("rejects > 100 char title", () => {
    expect(
      blockSchemas.header.safeParse({ title: "x".repeat(101) }).success,
    ).toBe(false);
  });
});
