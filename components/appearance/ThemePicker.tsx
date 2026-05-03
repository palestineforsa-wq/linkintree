"use client";

import { useTransition, useState } from "react";
import { THEME_PRESETS, tokensToStyle } from "@/lib/themes/presets";
import { THEME_PRESET_NAMES, type ThemePreset } from "@/lib/themes/types";
import { updateProfileThemeAction } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ThemePicker({
  current,
}: {
  current: ThemePreset;
}) {
  const [selected, setSelected] = useState<ThemePreset>(current);
  const [pending, startTransition] = useTransition();

  const choose = (preset: ThemePreset) => {
    if (preset === selected) return;
    setSelected(preset); // optimistic
    startTransition(async () => {
      const result = await updateProfileThemeAction({ preset });
      if (!result.ok) setSelected(current);
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {THEME_PRESET_NAMES.map((name) => {
        const preset = THEME_PRESETS[name];
        const isSelected = selected === name;
        return (
          <button
            key={name}
            type="button"
            disabled={pending}
            onClick={() => choose(name)}
            className={cn(
              "relative flex flex-col gap-3 rounded-lg border p-4 text-left transition",
              isSelected
                ? "border-primary ring-2 ring-primary"
                : "hover:border-foreground/30",
            )}
            aria-pressed={isSelected}
          >
            {isSelected ? (
              <span
                aria-hidden
                className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Check className="h-3 w-3" />
              </span>
            ) : null}
            <PresetSwatch tokens={preset.tokens} />
            <div className="text-sm font-medium">{preset.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function PresetSwatch({
  tokens,
}: {
  tokens: (typeof THEME_PRESETS)[ThemePreset]["tokens"];
}) {
  // Mini-preview: rendered with the preset's tokens so each card looks like
  // a tiny version of what the public page will look like.
  return (
    <div
      style={tokensToStyle(tokens)}
      className="rounded-md border p-3"
    >
      <div className="mx-auto mb-2 h-6 w-6 rounded-full"
        style={{ backgroundColor: `hsl(${tokens.muted})` }} />
      <div className="flex flex-col gap-1">
        <div
          className="h-4 rounded-sm"
          style={{ backgroundColor: `hsl(${tokens.card})`, border: `1px solid hsl(${tokens.border})` }}
        />
        <div
          className="h-4 rounded-sm"
          style={{ backgroundColor: `hsl(${tokens.card})`, border: `1px solid hsl(${tokens.border})` }}
        />
        <div
          className="h-4 rounded-sm"
          style={{ backgroundColor: `hsl(${tokens.card})`, border: `1px solid hsl(${tokens.border})` }}
        />
      </div>
    </div>
  );
}
