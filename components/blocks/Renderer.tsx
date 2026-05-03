import type { Block } from "@/lib/db/schema";
import {
  blockSchemas,
  type BlockData,
  type BlockType,
} from "@/lib/blocks/schemas";
import { LinkRenderer } from "./Link/Renderer";
import { HeaderRenderer } from "./Header/Renderer";
import { SocialRowRenderer } from "./SocialRow/Renderer";
import { SpacerRenderer } from "./Spacer/Renderer";

// Type-erased dispatcher. Each renderer receives its parsed data + the raw
// block for any cross-cutting needs (id for click logger href, etc).
type RendererFn = (props: {
  data: unknown;
  block: Block;
  hrefForBlock: (id: string) => string;
}) => React.ReactNode;

const RENDERERS: { [T in BlockType]?: RendererFn } = {
  link: ({ data, block, hrefForBlock }) => (
    <LinkRenderer
      data={data as BlockData<"link">}
      href={hrefForBlock(block.id)}
    />
  ),
  header: ({ data }) => (
    <HeaderRenderer data={data as BlockData<"header">} />
  ),
  social_row: ({ data }) => (
    <SocialRowRenderer data={data as BlockData<"social_row">} />
  ),
  spacer: ({ data }) => (
    <SpacerRenderer data={data as BlockData<"spacer">} />
  ),
  // Pro types land here in MYWEB-10.
};

export function defaultHrefForBlock(blockId: string) {
  return `/api/click/${blockId}`;
}

export function BlockRenderer({
  block,
  hrefForBlock = defaultHrefForBlock,
}: {
  block: Block;
  hrefForBlock?: (id: string) => string;
}) {
  const fn = RENDERERS[block.type as BlockType];
  if (!fn) return null;
  const parsed = blockSchemas[block.type as BlockType].safeParse(block.data);
  if (!parsed.success) return null; // bad data — silently drop
  return fn({ data: parsed.data, block, hrefForBlock });
}
