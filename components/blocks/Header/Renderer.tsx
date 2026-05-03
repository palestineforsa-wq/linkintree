import type { BlockData } from "@/lib/blocks/schemas";

export function HeaderRenderer({ data }: { data: BlockData<"header"> }) {
  return (
    <h2 className="pt-2 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {data.title}
    </h2>
  );
}
