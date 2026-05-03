import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_PRESET,
  THEME_PRESETS,
  tokensToStyle,
} from "@/lib/themes/presets";
import {
  profileThemeSchema,
  resolveProfileTheme,
  getThemeTokens,
} from "@/lib/themes/schema";
import { THEME_PRESET_NAMES } from "@/lib/themes/types";

describe("theme presets", () => {
  it("ships all four free-tier presets", () => {
    expect(Object.keys(THEME_PRESETS).sort()).toEqual(
      [...THEME_PRESET_NAMES].sort(),
    );
  });

  it("every preset has a label and full token set", () => {
    for (const name of THEME_PRESET_NAMES) {
      const preset = THEME_PRESETS[name];
      expect(preset.label).toBeTruthy();
      const t = preset.tokens;
      expect(t.background).toBeTruthy();
      expect(t.foreground).toBeTruthy();
      expect(t.card).toBeTruthy();
      expect(t.cardForeground).toBeTruthy();
      expect(t.border).toBeTruthy();
      expect(t.muted).toBeTruthy();
      expect(t.mutedForeground).toBeTruthy();
      expect(t.accent).toBeTruthy();
      expect(t.accentForeground).toBeTruthy();
      expect(t.ring).toBeTruthy();
      expect(t.radius).toMatch(/rem|px$/);
    }
  });

  it("default preset is daylight", () => {
    expect(DEFAULT_THEME_PRESET).toBe("daylight");
  });
});

describe("profileThemeSchema", () => {
  it("accepts a valid preset", () => {
    expect(
      profileThemeSchema.safeParse({ preset: "midnight" }).success,
    ).toBe(true);
  });

  it("rejects an unknown preset", () => {
    expect(
      profileThemeSchema.safeParse({ preset: "tropical" }).success,
    ).toBe(false);
  });

  it("rejects missing preset key", () => {
    expect(profileThemeSchema.safeParse({}).success).toBe(false);
  });
});

describe("resolveProfileTheme — tolerant fallback", () => {
  it("returns valid theme as-is", () => {
    expect(resolveProfileTheme({ preset: "sage" })).toEqual({ preset: "sage" });
  });

  it("falls back to default on null", () => {
    expect(resolveProfileTheme(null)).toEqual({
      preset: DEFAULT_THEME_PRESET,
    });
  });

  it("falls back on garbage", () => {
    expect(resolveProfileTheme({ preset: "neon-purple" })).toEqual({
      preset: DEFAULT_THEME_PRESET,
    });
  });
});

describe("getThemeTokens", () => {
  it("returns the tokens for the resolved preset", () => {
    const tokens = getThemeTokens({ preset: "midnight" });
    expect(tokens).toBe(THEME_PRESETS.midnight.tokens);
  });
});

describe("tokensToStyle", () => {
  it("emits all CSS custom properties + background/color", () => {
    const tokens = THEME_PRESETS.daylight.tokens;
    const style = tokensToStyle(tokens) as Record<string, string>;
    expect(style["--background"]).toBe(tokens.background);
    expect(style["--foreground"]).toBe(tokens.foreground);
    expect(style["--card"]).toBe(tokens.card);
    expect(style["--card-foreground"]).toBe(tokens.cardForeground);
    expect(style["--border"]).toBe(tokens.border);
    expect(style["--accent"]).toBe(tokens.accent);
    expect(style["--accent-foreground"]).toBe(tokens.accentForeground);
    expect(style["--radius"]).toBe(tokens.radius);
    expect(style.backgroundColor).toContain(tokens.background);
    expect(style.color).toContain(tokens.foreground);
  });
});
