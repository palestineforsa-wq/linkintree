import { z } from "zod";

// Form inputs that bind to optional fields default to "" in HTML; "" doesn't
// satisfy enum/.url() checks. Coerce to undefined before downstream parsing
// so editors don't silently fail validation when an optional field is empty.
const optionalString = (inner: z.ZodTypeAny) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.length === 0 ? undefined : v),
    inner.optional(),
  );

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
  thumbnail_url: optionalString(z.string().url()),
  badge: optionalString(z.enum(["new", "popular", "limited"])),
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
  poster_url: optionalString(z.string().url()),
});

const emailCaptureBlock = z.object({
  headline: z.string().min(1).max(100),
  cta: z.string().min(1).max(40).default("Subscribe"),
  success_message: optionalString(z.string().max(200)),
});

const productBlock = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  price_text: z.string().min(1).max(40),
  image_url: optionalString(z.string().url()),
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
