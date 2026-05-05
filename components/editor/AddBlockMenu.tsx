"use client";

import { useState, useTransition } from "react";
import { createBlockAction } from "@/lib/actions/blocks";
import {
  BLOCK_REGISTRY,
  BLOCK_TYPE_ORDER,
} from "@/lib/blocks/registry";
import type { BlockType } from "@/lib/blocks/schemas";
import { Button } from "@/components/ui/button";
import { Lock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import type { EditorBlock } from "./BlockList";

export function AddBlockMenu({
  isPro,
  onAdded,
}: {
  isPro: boolean;
  onAdded?: (block: EditorBlock) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const create = (type: BlockType) => {
    setError(null);
    startTransition(async () => {
      const result = await createBlockAction(type);
      if (!result.ok) {
        // Server-side gate hit. Surface the upgrade modal instead of a
        // dead-end error; the message comes from the gate itself.
        if (
          result.error.includes("limit") ||
          result.error.includes("Pro")
        ) {
          setUpgradeReason(result.error);
          setOpen(false);
          return;
        }
        setError(result.error);
        return;
      }
      setOpen(false);
      if (result.data) onAdded?.(result.data);
    });
  };

  return (
    <div className="relative">
      <Button onClick={() => setOpen((o) => !o)} disabled={pending}>
        <Plus className="h-4 w-4" /> Add block
      </Button>

      {open && (
        <div
          className="absolute left-0 top-full z-10 mt-2 w-72 rounded-md border bg-background p-2 shadow-lg"
          role="menu"
        >
          <ul className="flex flex-col gap-1">
            {BLOCK_TYPE_ORDER.map((type) => {
              const meta = BLOCK_REGISTRY[type];
              const locked = meta.pro && !isPro;
              return (
                <li key={type}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      locked
                        ? setUpgradeReason(
                            `${meta.label} blocks are a Pro feature.`,
                          )
                        : create(type)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                      locked && "opacity-70",
                    )}
                  >
                    <span className="flex-1">
                      <span className="font-medium">{meta.label}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        — {meta.description}
                      </span>
                    </span>
                    {locked && <Lock className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {error && (
            <p className="mt-2 px-2 text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
      <UpgradeModal
        open={upgradeReason !== null}
        reason={upgradeReason ?? undefined}
        onClose={() => setUpgradeReason(null)}
      />
    </div>
  );
}
