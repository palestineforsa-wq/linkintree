import type { BlockData } from "@/lib/blocks/schemas";

const BADGE_LABEL: Record<NonNullable<BlockData<"link">["badge"]>, string> = {
  new: "New",
  popular: "Popular",
  limited: "Limited",
};

export function LinkRenderer({
  data,
  href,
}: {
  data: BlockData<"link">;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-3 rounded-2xl glass-button px-4 py-3.5 text-sm font-medium hover:bg-white/15"
    >
      {data.thumbnail_url ? (
        <span
          aria-hidden
          className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted"
          style={{
            backgroundImage: `url(${data.thumbnail_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}
      <span className="flex-1 truncate text-center">{data.title}</span>
      {data.badge ? (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
          {BADGE_LABEL[data.badge]}
        </span>
      ) : null}
    </a>
  );
}
