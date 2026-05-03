import type { BlockType } from "./schemas";

// Public renderer per block type. Each block type owns its renderer; no
// `if (type === 'link')` ladders allowed elsewhere — add a renderer here.
type Block = { id: string; type: BlockType; data: unknown };

export function BlockRenderer({ block: _block }: { block: Block }) {
  // TODO MYWEB-6/10: dispatch on block.type with parseBlockData(type, data)
  return null;
}
