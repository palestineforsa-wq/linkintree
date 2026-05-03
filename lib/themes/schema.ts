import { z } from "zod";
import { THEME_PRESET_NAMES, type ProfileTheme } from "./types";
import { DEFAULT_THEME_PRESET, THEME_PRESETS } from "./presets";

export const profileThemeSchema = z.object({
  preset: z.enum(THEME_PRESET_NAMES),
});

// Tolerant: bad/missing themes fall back to the default rather than 500ing
// the public profile page. Free users only ever pick from the preset list;
// Pro custom themes (MYWEB-9) will widen this schema.
export function resolveProfileTheme(raw: unknown): ProfileTheme {
  const parsed = profileThemeSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return { preset: DEFAULT_THEME_PRESET };
}

export function getThemeTokens(theme: ProfileTheme) {
  return THEME_PRESETS[theme.preset].tokens;
}
