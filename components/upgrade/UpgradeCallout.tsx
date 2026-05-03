"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "./UpgradeModal";
import { cn } from "@/lib/utils";

// Small inline upsell card. Renders next to the gated feature so users see
// what they unlock by upgrading. Click → UpgradeModal.
export function UpgradeCallout({
  title,
  description,
  className,
  reason,
  size = "default",
}: {
  title: string;
  description?: string;
  className?: string;
  reason?: string;
  size?: "default" | "sm";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border border-dashed bg-muted/40",
          size === "sm" ? "p-3" : "p-4",
          className,
        )}
      >
        <span
          aria-hidden
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Upgrade
        </Button>
      </div>
      <UpgradeModal
        open={open}
        reason={reason}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
