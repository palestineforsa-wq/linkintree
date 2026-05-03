import type { BlockData } from "@/lib/blocks/schemas";

const HEIGHT: Record<NonNullable<BlockData<"spacer">["height"]>, string> = {
  sm: "h-3",
  md: "h-6",
  lg: "h-12",
};

export function SpacerRenderer({ data }: { data: BlockData<"spacer"> }) {
  return <div className={HEIGHT[data.height ?? "md"]} aria-hidden />;
}
