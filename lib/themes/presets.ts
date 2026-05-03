import type { ThemePreset, ThemeTokens } from "./types";

// Free tier ships these four. Pro unlocks the full editor (MYWEB-9).
// All values are HSL components without the `hsl()` wrapper, matching
// app/globals.css. Designed for AAA contrast on link buttons.

export const THEME_PRESETS: Record<
  ThemePreset,
  { label: string; tokens: ThemeTokens }
> = {
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

export const DEFAULT_THEME_PRESET: ThemePreset = "daylight";

// Build the inline `style` object for a wrapper element. Setting these as
// CSS custom properties at the wrapper level means every Tailwind class that
// reads `var(--background)` / etc. inside this subtree gets the profile's
// values without any class rewriting.
export function tokensToStyle(tokens: ThemeTokens): React.CSSProperties {
  return {
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
    backgroundColor: `hsl(${tokens.background})`,
    color: `hsl(${tokens.foreground})`,
  } as React.CSSProperties;
}
