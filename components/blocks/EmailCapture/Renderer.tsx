"use client";

import { useState, useTransition } from "react";
import type { BlockData } from "@/lib/blocks/schemas";
import { captureEmailAction } from "@/lib/actions/email-capture";
import { Button } from "@/components/ui/button";

export function EmailCaptureRenderer({
  blockId,
  data,
}: {
  blockId: string;
  data: BlockData<"email_capture">;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  if (status.kind === "ok") {
    return (
      <div className="rounded-md border bg-card p-4 text-center text-sm">
        {data.success_message ?? "Thanks — you're on the list."}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus({ kind: "idle" });
        startTransition(async () => {
          const result = await captureEmailAction({ blockId, email });
          setStatus(
            result.ok
              ? { kind: "ok" }
              : { kind: "error", message: result.error },
          );
        });
      }}
      className="flex flex-col gap-3 rounded-md border bg-card p-4"
    >
      <p className="text-center text-sm font-medium">{data.headline}</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" disabled={pending || email.length === 0}>
        {pending ? "Submitting…" : (data.cta ?? "Subscribe")}
      </Button>
      {status.kind === "error" ? (
        <p className="text-center text-xs text-destructive">{status.message}</p>
      ) : null}
    </form>
  );
}
