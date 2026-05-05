import type { BlockData } from "@/lib/blocks/schemas";

export function ProductRenderer({
  data,
}: {
  data: BlockData<"product">;
}) {
  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm transition hover:bg-accent"
    >
      {data.image_url ? (
        <span
          aria-hidden
          className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted"
          style={{
            backgroundImage: `url(${data.image_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <span
          aria-hidden
          className="h-14 w-14 shrink-0 rounded-md bg-muted"
        />
      )}
      <span className="flex-1">
        <span className="block font-medium">{data.title}</span>
        <span className="text-xs text-muted-foreground">{data.price_text}</span>
      </span>
      <span className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
        Buy
      </span>
    </a>
  );
}
