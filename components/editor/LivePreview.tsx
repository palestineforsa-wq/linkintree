"use client";

import type { Block } from "@/lib/db/schema";
import {
  blockSchemas,
  type BlockData,
  type BlockType,
} from "@/lib/blocks/schemas";
import { LinkRenderer } from "@/components/blocks/Link/Renderer";
import { HeaderRenderer } from "@/components/blocks/Header/Renderer";
import { SocialRowRenderer } from "@/components/blocks/SocialRow/Renderer";
import { SpacerRenderer } from "@/components/blocks/Spacer/Renderer";
import { EmbedRenderer } from "@/components/blocks/Embed/Renderer";
import { ProductRenderer } from "@/components/blocks/Product/Renderer";
import type { EditorBlock } from "./BlockList";

// Mirrors components/blocks/Renderer but client-side and tolerant — used for
// the in-editor preview where blocks may have invalid data while the user
// types. Public page uses the server Renderer with strict parsing.
export function LivePreview({
  blocks,
  username,
  displayName,
}: {
  blocks: EditorBlock[];
  username: string;
  displayName?: string | null;
}) {
  const visible = blocks.filter((b) => b.isActive);

  return (
    <div className="sticky top-6 mx-auto w-full max-w-sm rounded-3xl border bg-background p-4 shadow-sm">
      <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        Preview
      </div>
      <div className="rounded-2xl border bg-muted/30 px-4 py-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
          <h2 className="mt-3 text-base font-semibold">
            {displayName || `@${username}`}
          </h2>
          <p className="text-xs text-muted-foreground">@{username}</p>
        </div>
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((b) => (
            <PreviewBlock key={b.id} block={b} />
          ))}
        </ul>
        {visible.length === 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Activate or add a block to see it here.
          </p>
        )}
      </div>
    </div>
  );
}

function PreviewBlock({ block }: { block: EditorBlock }) {
  const parsed = blockSchemas[block.type as BlockType]?.safeParse(block.data);
  if (!parsed?.success) {
    return (
      <li className="rounded-md border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
        Fix this block to preview it
      </li>
    );
  }

  const fakeBlock: Block = {
    id: block.id,
    profileId: "",
    type: block.type,
    position: block.position,
    isActive: block.isActive,
    data: block.data,
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  switch (block.type) {
    case "link":
      return (
        <li>
          <LinkRenderer data={parsed.data as BlockData<"link">} href="#" />
        </li>
      );
    case "header":
      return (
        <li>
          <HeaderRenderer data={parsed.data as BlockData<"header">} />
        </li>
      );
    case "social_row":
      return (
        <li>
          <SocialRowRenderer data={parsed.data as BlockData<"social_row">} />
        </li>
      );
    case "spacer":
      return (
        <li>
          <SpacerRenderer data={parsed.data as BlockData<"spacer">} />
        </li>
      );
    case "embed":
      return (
        <li>
          <EmbedRenderer data={parsed.data as BlockData<"embed">} />
        </li>
      );
    case "product":
      return (
        <li>
          <ProductRenderer data={parsed.data as BlockData<"product">} />
        </li>
      );
    case "email_capture":
      return (
        <li>
          <div className="rounded-md border border-dashed bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            Email capture form
          </div>
        </li>
      );
    case "video":
      return (
        <li>
          <div className="rounded-md border border-dashed bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            Video (preview after upload)
          </div>
        </li>
      );
    default:
      void fakeBlock;
      return null;
  }
}
