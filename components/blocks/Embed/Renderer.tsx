import type { BlockData } from "@/lib/blocks/schemas";
import { parseEmbedUrl } from "@/lib/embed/providers";

export function EmbedRenderer({ data }: { data: BlockData<"embed"> }) {
  const parsed = parseEmbedUrl(data.url);
  if (!parsed) {
    return (
      <div className="rounded-md border border-dashed bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        Unsupported URL — paste a YouTube, Vimeo, Spotify, or TikTok link.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-md border bg-card"
      style={{ aspectRatio: parsed.aspectRatio }}
    >
      <iframe
        src={parsed.embedSrc}
        title={`${parsed.provider} embed`}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-full w-full"
      />
    </div>
  );
}
