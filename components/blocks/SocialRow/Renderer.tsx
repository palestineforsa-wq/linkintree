import type { BlockData } from "@/lib/blocks/schemas";

const PLATFORM_LABEL: Record<
  BlockData<"social_row">["links"][number]["platform"],
  string
> = {
  twitter: "Twitter",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  github: "GitHub",
  linkedin: "LinkedIn",
  twitch: "Twitch",
  spotify: "Spotify",
  website: "Website",
};

export function SocialRowRenderer({
  data,
}: {
  data: BlockData<"social_row">;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-2">
      {data.links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={PLATFORM_LABEL[link.platform]}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium hover:bg-accent"
        >
          {PLATFORM_LABEL[link.platform].slice(0, 2)}
        </a>
      ))}
    </div>
  );
}
