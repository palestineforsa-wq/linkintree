import type { BlockType } from "./schemas";

// Admin editor per block type. Mirrors render.tsx — one component per type.
type Block = { id: string; type: BlockType; data: unknown };

export function BlockEditor({ block: _block }: { block: Block }) {
  // TODO MYWEB-5: dispatch on block.type, render react-hook-form + zod resolver
  return null;
}
