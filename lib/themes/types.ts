// Theme tokens are HSL components (e.g. "0 0% 100%") so they slot into the
// existing globals.css custom-property machinery: a profile theme overrides
// --background, --foreground, etc. on a wrapper element, and the renderer
// classes (bg-background, text-foreground, …) just pick up the new values.

export type ThemeTokens = {
  background: string; // hsl components, e.g. "0 0% 100%"
  foreground: string;
  card: string; // link-block button bg
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  accent: string; // for badges, hover
  accentForeground: string;
  ring: string;
  radius: string; // CSS length, e.g. "0.5rem"
};

export const THEME_PRESET_NAMES = [
  "daylight",
  "midnight",
  "linen",
  "sage",
] as const;

export type ThemePreset = (typeof THEME_PRESET_NAMES)[number];

export type ProfileTheme = {
  preset: ThemePreset;
};
