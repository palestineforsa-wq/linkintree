import type { BlockData } from "@/lib/blocks/schemas";

export function VideoRenderer({ data }: { data: BlockData<"video"> }) {
  // Renders only when the storage_path looks like a real upload, not the
  // registry placeholder. Shipping a black box for placeholder values would
  // be confusing on the public page.
  if (!data.storage_path || data.storage_path === "placeholder.mp4") {
    return null;
  }
  return (
    <video
      src={data.storage_path}
      poster={data.poster_url}
      controls
      preload="metadata"
      className="w-full rounded-md border bg-card"
    />
  );
}
