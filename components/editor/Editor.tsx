"use client";

import { useState } from "react";
import { AddBlockMenu } from "./AddBlockMenu";
import { BlockList, type EditorBlock } from "./BlockList";
import { LivePreview } from "./LivePreview";
import { useRouter } from "next/navigation";

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
  const [blocks, setBlocks] = useState(initialBlocks);
  const router = useRouter();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-4">
          <AddBlockMenu
            isPro={isPro}
            onAdded={() => {
              // Server inserted a new row — re-fetch via the RSC.
              router.refresh();
            }}
          />
        </div>
        <BlockList
          initialBlocks={initialBlocks}
          onBlocksChange={setBlocks}
        />
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
