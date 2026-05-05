import type { ThemePreset, ThemeTokens } from "./types";

// Free tier ships these five. Pro unlocks the full editor (MYWEB-9).
// All values are HSL components without the `hsl()` wrapper, matching
// app/globals.css. Designed for AAA contrast on link buttons.

export const THEME_PRESETS: Record<
  ThemePreset,
  { label: string; tokens: ThemeTokens }
> = {
  glass: {
    label: "Liquid Glass",
    tokens: {
      background: "240 20% 5%",
      foreground: "0 0% 98%",
      card: "240 18% 9%",
      cardForeground: "0 0% 98%",
      border: "240 14% 20%",
      muted: "240 12% 16%",
      mutedForeground: "240 8% 70%",
      accent: "250 90% 70%",
      accentForeground: "0 0% 98%",
      ring: "250 90% 70%",
      radius: "1rem",
      mesh1: "268 100% 60%",
      mesh2: "196 100% 56%",
      mesh3: "320 100% 60%",
      mesh4: "220 100% 50%",
      glass: true,
    },
  },
  daylight: {
    label: "Daylight",
    tokens: {
      background: "0 0% 100%",
      foreground: "0 0% 9%",
      card: "0 0% 100%",
      cardForeground: "0 0% 9%",
      border: "0 0% 89.8%",
      muted: "0 0% 96.1%",
      mutedForeground: "0 0% 45.1%",
      accent: "0 0% 9%",
      accentForeground: "0 0% 98%",
      ring: "0 0% 9%",
      radius: "0.75rem",
    },
  },
  midnight: {
    label: "Midnight",
    tokens: {
      background: "0 0% 6%",
      foreground: "0 0% 96%",
      card: "0 0% 12%",
      cardForeground: "0 0% 98%",
      border: "0 0% 20%",
      muted: "0 0% 14%",
      mutedForeground: "0 0% 65%",
      accent: "0 0% 96%",
      accentForeground: "0 0% 9%",
      ring: "0 0% 70%",
      radius: "0.75rem",
    },
  },
  linen: {
    label: "Linen",
    tokens: {
      background: "33 33% 96%",
      foreground: "30 18% 18%",
      card: "33 50% 99%",
      cardForeground: "30 18% 18%",
      border: "30 20% 85%",
      muted: "33 25% 92%",
      mutedForeground: "30 15% 45%",
      accent: "16 60% 45%",
      accentForeground: "33 50% 98%",
      ring: "16 60% 45%",
      radius: "0.5rem",
    },
  },
  sage: {
    label: "Sage",
    tokens: {
      background: "120 12% 92%",
      foreground: "150 12% 18%",
      card: "120 18% 97%",
      cardForeground: "150 12% 18%",
      border: "120 10% 78%",
      muted: "120 10% 88%",
      mutedForeground: "150 8% 40%",
      accent: "150 25% 30%",
      accentForeground: "120 18% 97%",
      ring: "150 25% 30%",
      radius: "1rem",
    },
  },
};

export const DEFAULT_THEME_PRESET: ThemePreset = "glass";

// Build the inline `style` object for a wrapper element. CSS variables flow
// through the renderer's bg-foo / text-foo classes; mesh tokens are read by
// public-page wrappers to override the global mesh palette.
export function tokensToStyle(tokens: ThemeTokens): React.CSSProperties {
  const base: Record<string, string> = {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--card": tokens.card,
    "--card-foreground": tokens.cardForeground,
    "--border": tokens.border,
    "--muted": tokens.muted,
    "--muted-foreground": tokens.mutedForeground,
    "--accent": tokens.accent,
    "--accent-foreground": tokens.accentForeground,
    "--ring": tokens.ring,
    "--radius": tokens.radius,
  };
  if (tokens.mesh1) base["--mesh-1"] = tokens.mesh1;
  if (tokens.mesh2) base["--mesh-2"] = tokens.mesh2;
  if (tokens.mesh3) base["--mesh-3"] = tokens.mesh3;
  if (tokens.mesh4) base["--mesh-4"] = tokens.mesh4;
  // Glass theme floats on the global mesh background; keep the wrapper
  // transparent so the mesh shows through. Other presets paint solid.
  if (!tokens.glass) {
    base.backgroundColor = `hsl(${tokens.background})`;
    base.color = `hsl(${tokens.foreground})`;
  } else {
    base.color = `hsl(${tokens.foreground})`;
  }
  return base as React.CSSProperties;
}

export function isGlassPreset(preset: ThemePreset) {
  return THEME_PRESETS[preset].tokens.glass === true;
}
