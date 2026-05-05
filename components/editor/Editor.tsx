"use client";

import { useState } from "react";
import { AddBlockMenu } from "./AddBlockMenu";
import { BlockList, type EditorBlock } from "./BlockList";
import { LivePreview } from "./LivePreview";

export function DashboardEditor({
  initialBlocks,
  username,
  displayName,
  isPro,
}: {
  initialBlocks: EditorBlock[];
  username: string;
  displayName: string | null;
  isPro: boolean;
}) {
  // Parent owns the canonical client-side block list. Children are controlled.
  // Adds, edits, drags, deletes, toggles all flow through here so a single
  // setState updates both the editor list AND the live preview.
  const [blocks, setBlocks] = useState(initialBlocks);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4">
          <AddBlockMenu
            isPro={isPro}
            onAdded={(block) => setBlocks((prev) => [...prev, block])}
          />
        </div>
        <BlockList blocks={blocks} onChange={setBlocks} />
      </section>
      <aside>
        <LivePreview
          blocks={blocks}
          username={username}
          displayName={displayName}
        />
      </aside>
    </div>
  );
}
