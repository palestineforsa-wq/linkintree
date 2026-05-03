import {
  blockSchemas,
  type BlockData,
  type BlockType,
} from "./schemas";

// Block registry — single source of truth for "things you can do per type".
// Adding a new type = one row here + one Renderer + one Editor. Spec §6:
// "Adding a new block type is one folder, not a refactor."

type BlockMeta<T extends BlockType> = {
  label: string; // shown in the type picker
  description: string;
  defaultData: BlockData<T>;
  pro: boolean; // gated behind Pro
};

export const BLOCK_REGISTRY: { [T in BlockType]: BlockMeta<T> } = {
  link: {
    label: "Link",
    description: "A button that goes somewhere.",
    pro: false,
    defaultData: { title: "New link", url: "https://example.com" },
  },
  header: {
    label: "Header",
    description: "Group links under a section title.",
    pro: false,
    defaultData: { title: "Section title" },
  },
  social_row: {
    label: "Socials",
    description: "Row of icons for your platforms.",
    pro: false,
    defaultData: {
      links: [{ platform: "instagram", url: "https://instagram.com/" }],
    },
  },
  spacer: {
    label: "Spacer",
    description: "Visual breathing room.",
    pro: false,
    defaultData: { height: "md" },
  },
  embed: {
    label: "Embed",
    description: "YouTube, Spotify, Vimeo, TikTok.",
    pro: true,
    defaultData: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      provider: "auto",
    },
  },
  video: {
    label: "Video",
    description: "Self-hosted MP4.",
    pro: true,
    defaultData: { storage_path: "placeholder.mp4" },
  },
  email_capture: {
    label: "Email capture",
    description: "Inline subscribe form.",
    pro: true,
    defaultData: { headline: "Subscribe", cta: "Subscribe" },
  },
  product: {
    label: "Product",
    description: 'Title + price + "Buy" button.',
    pro: true,
    defaultData: {
      title: "Product",
      url: "https://example.com",
      price_text: "$0",
    },
  },
};

export function getBlockMeta<T extends BlockType>(type: T): BlockMeta<T> {
  return BLOCK_REGISTRY[type];
}

export function safeParseBlockData(type: BlockType, data: unknown) {
  return blockSchemas[type].safeParse(data);
}

export const BLOCK_TYPE_ORDER: BlockType[] = [
  "link",
  "header",
  "social_row",
  "spacer",
  "embed",
  "video",
  "email_capture",
  "product",
];
