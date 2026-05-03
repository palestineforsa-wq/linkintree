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
      className="relative flex items-center gap-3 rounded-md border bg-background px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-accent"
    >
      {data.thumbnail_url ? (
        <span
          aria-hidden
          className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted"
          style={{
            backgroundImage: `url(${data.thumbnail_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}
      <span className="flex-1 truncate text-center">{data.title}</span>
      {data.badge ? (
        <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
          {BADGE_LABEL[data.badge]}
        </span>
      ) : null}
    </a>
  );
}
