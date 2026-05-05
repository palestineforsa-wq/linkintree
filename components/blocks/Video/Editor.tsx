"use client";

import { Button } from "@/components/ui/button";

// MYWEB-10 ships this stub. Real upload requires the operator to create a
// public Supabase Storage bucket and an RLS policy allowing authenticated
// uploads. Steps documented in the toast below; the upload button is
// disabled until that bucket exists. Wiring lands when the bucket name
// is configured via NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET.

export function VideoEditor() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-dashed bg-muted/40 p-4 text-sm">
        <p className="font-medium">Storage bucket not configured.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          To enable video uploads, create a public bucket in Supabase Storage
          (e.g. <code>block-videos</code>), allow authenticated uploads via
          RLS, and set <code>NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET</code> in your
          environment.
        </p>
      </div>
      <Button type="button" disabled aria-disabled>
        Upload video
      </Button>
    </div>
  );
}
