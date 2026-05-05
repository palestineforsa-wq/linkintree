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
import { EmbedRenderer } from "./Embed/Renderer";
import { VideoRenderer } from "./Video/Renderer";
import { ProductRenderer } from "./Product/Renderer";
import { EmailCaptureRenderer } from "./EmailCapture/Renderer";

// Type-erased dispatcher. Each renderer receives its parsed data + the raw
// block. Spec §6 — adding a type means one row here, no if-ladders.
type RendererFn = (props: {
  data: unknown;
  block: Block;
  hrefForBlock: (id: string) => string;
}) => React.ReactNode;

const RENDERERS: { [T in BlockType]: RendererFn } = {
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
  embed: ({ data }) => <EmbedRenderer data={data as BlockData<"embed">} />,
  video: ({ data }) => <VideoRenderer data={data as BlockData<"video">} />,
  product: ({ data }) => (
    <ProductRenderer data={data as BlockData<"product">} />
  ),
  email_capture: ({ data, block }) => (
    <EmailCaptureRenderer
      blockId={block.id}
      data={data as BlockData<"email_capture">}
    />
  ),
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
  if (!parsed.success) return null;
  return fn({ data: parsed.data, block, hrefForBlock });
}
