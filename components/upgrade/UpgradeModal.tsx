"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// "Pro is coming soon" modal. Replaces the Stripe Checkout flow until
// MYWEB-8 lands; opening it just confirms intent and shows feature list.

const PRO_FEATURES = [
  "Unlimited blocks (Free is capped at 5)",
  "All 8 block types — embed, video, email capture, product",
  "Custom theme editor + custom CSS",
  "Block scheduling (start/end dates)",
  "Custom OG image",
  "Verified badge eligibility",
  "Full analytics history, CTR per block, geo, devices, referrers, cohorts",
  "Unlimited email capture exports",
  '"Powered by" footer hidden',
] as const;

export function UpgradeModal({
  open,
  reason,
  onClose,
}: {
  open: boolean;
  reason?: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="upgrade-title" className="text-xl font-semibold">
          Pro is coming soon
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {reason ??
            "We're finalizing pricing. Drop your email below and we'll let you know the moment Pro is ready."}
        </p>

        <ul className="mt-5 flex flex-col gap-2 text-sm">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 text-emerald-600">
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Maybe later
          </Button>
          <Button disabled aria-disabled title="Pricing TBD">
            Notify me
          </Button>
        </div>
      </div>
    </div>
  );
}
