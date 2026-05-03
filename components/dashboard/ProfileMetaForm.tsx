"use client";

import { useState, useTransition } from "react";
import { updateProfileMetaAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";

export function ProfileMetaForm({
  initialDisplayName,
  initialBio,
}: {
  initialDisplayName: string | null;
  initialBio: string | null;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    { ok: true } | { ok: false; error: string } | null
  >(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus(null);
        startTransition(async () => {
          const result = await updateProfileMetaAction({ displayName, bio });
          setStatus(
            result.ok ? { ok: true } : { ok: false, error: result.error },
          );
        });
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Display name</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your public name"
          maxLength={60}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A line or two about you."
          maxLength={280}
          rows={3}
          className="rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground">
          {bio.length}/280
        </span>
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {status?.ok ? (
          <span className="text-xs text-emerald-600">Saved.</span>
        ) : null}
        {status && !status.ok ? (
          <span className="text-xs text-destructive">{status.error}</span>
        ) : null}
      </div>
    </form>
  );
}
