import { z } from "zod";

export const BLOCK_TYPES = [
  "link",
  "header",
  "social_row",
  "spacer",
  "embed",
  "video",
  "email_capture",
  "product",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

const linkBlock = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  badge: z.enum(["new", "popular", "limited"]).optional(),
});

const headerBlock = z.object({
  title: z.string().min(1).max(100),
});

const socialRowBlock = z.object({
  links: z
    .array(
      z.object({
        platform: z.enum([
          "twitter",
          "x",
          "instagram",
          "tiktok",
          "youtube",
          "github",
          "linkedin",
          "twitch",
          "spotify",
          "website",
        ]),
        url: z.string().url(),
      }),
    )
    .min(1)
    .max(12),
});

const spacerBlock = z.object({
  height: z.enum(["sm", "md", "lg"]).default("md"),
});

const embedBlock = z.object({
  url: z.string().url(),
  provider: z
    .enum(["youtube", "spotify", "vimeo", "tiktok", "auto"])
    .default("auto"),
});

const videoBlock = z.object({
  storage_path: z.string().min(1),
  poster_url: z.string().url().optional(),
});

const emailCaptureBlock = z.object({
  headline: z.string().min(1).max(100),
  cta: z.string().min(1).max(40).default("Subscribe"),
  success_message: z.string().max(200).optional(),
});

const productBlock = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  price_text: z.string().min(1).max(40),
  image_url: z.string().url().optional(),
});

export const blockSchemas = {
  link: linkBlock,
  header: headerBlock,
  social_row: socialRowBlock,
  spacer: spacerBlock,
  embed: embedBlock,
  video: videoBlock,
  email_capture: emailCaptureBlock,
  product: productBlock,
} satisfies Record<BlockType, z.ZodTypeAny>;

export type BlockData<T extends BlockType> = z.infer<(typeof blockSchemas)[T]>;

export const FREE_BLOCK_TYPES: BlockType[] = [
  "link",
  "header",
  "social_row",
  "spacer",
];

export function parseBlockData<T extends BlockType>(
  type: T,
  data: unknown,
): BlockData<T> {
  return blockSchemas[type].parse(data) as BlockData<T>;
}
