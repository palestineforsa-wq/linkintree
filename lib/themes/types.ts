// Theme tokens are HSL components (e.g. "0 0% 100%") so they slot into the
// existing globals.css custom-property machinery: a profile theme overrides
// --background, --foreground, etc. on a wrapper element, and the renderer
// classes (bg-background, text-foreground, …) just pick up the new values.

export type ThemeTokens = {
  background: string; // hsl components, e.g. "0 0% 100%"
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  radius: string;
  // Optional mesh palette for liquid-glass theme; falls back to the chrome
  // mesh values when omitted.
  mesh1?: string;
  mesh2?: string;
  mesh3?: string;
  mesh4?: string;
  // Visual mode hint — tells renderers to use frosted-glass surfaces when
  // true. Currently set on the `glass` preset only.
  glass?: boolean;
};

export const THEME_PRESET_NAMES = [
  "glass",
  "daylight",
  "midnight",
  "linen",
  "sage",
] as const;

export type ThemePreset = (typeof THEME_PRESET_NAMES)[number];

export type ProfileTheme = {
  preset: ThemePreset;
};
