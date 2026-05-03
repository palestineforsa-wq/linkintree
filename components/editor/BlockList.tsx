"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import {
  deleteBlockAction,
  reorderBlocksAction,
  toggleBlockActiveAction,
  updateBlockAction,
} from "@/lib/actions/blocks";
import { BLOCK_REGISTRY } from "@/lib/blocks/registry";
import { BlockEditorByType } from "@/components/blocks/Editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/lib/blocks/schemas";

export type EditorBlock = {
  id: string;
  type: BlockType;
  data: unknown;
  isActive: boolean;
  position: number;
};

export function BlockList({
  initialBlocks,
  onBlocksChange,
}: {
  initialBlocks: EditorBlock[];
  onBlocksChange?: (blocks: EditorBlock[]) => void;
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [optimistic, setOptimistic] = useOptimistic(blocks);
  const [, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateLocal = (next: EditorBlock[]) => {
    setBlocks(next);
    onBlocksChange?.(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      position: i,
    }));
    updateLocal(next);

    startTransition(async () => {
      setOptimistic(next);
      await reorderBlocksAction({ orderedIds: next.map((b) => b.id) });
    });
  };

  const onUpdate = (id: string, data: unknown) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, data } : b));
    updateLocal(next);
    startTransition(async () => {
      setOptimistic(next);
      await updateBlockAction({ id, data });
    });
  };

  const onToggle = (id: string, isActive: boolean) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, isActive } : b));
    updateLocal(next);
    startTransition(async () => {
      setOptimistic(next);
      const result = await toggleBlockActiveAction({ id, isActive });
      if (!result.ok) {
        // Revert
        updateLocal(blocks);
      }
    });
  };

  const onDelete = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    updateLocal(next);
    startTransition(async () => {
      setOptimistic(next);
      await deleteBlockAction(id);
    });
  };

  if (optimistic.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No blocks yet. Add one above to get started.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={optimistic.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {optimistic.map((block) => (
            <SortableRow
              key={block.id}
              block={block}
              expanded={expandedId === block.id}
              onExpand={() =>
                setExpandedId((cur) => (cur === block.id ? null : block.id))
              }
              onUpdate={(data) => onUpdate(block.id, data)}
              onToggle={(active) => onToggle(block.id, active)}
              onDelete={() => onDelete(block.id)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  block,
  expanded,
  onExpand,
  onUpdate,
  onToggle,
  onDelete,
}: {
  block: EditorBlock;
  expanded: boolean;
  onExpand: () => void;
  onUpdate: (data: unknown) => void;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const meta = BLOCK_REGISTRY[block.type];

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border bg-background",
        !block.isActive && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {meta.label}
          </div>
          <div className="text-sm font-medium">
            {summarize(block)}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={block.isActive}
            onChange={(e) => onToggle(e.target.checked)}
          />
          Active
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={onExpand}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {expanded && (
        <div className="border-t p-3">
          <BlockEditorByType
            type={block.type}
            data={block.data}
            onChange={onUpdate}
          />
        </div>
      )}
    </li>
  );
}

function summarize(block: EditorBlock): string {
  const data = block.data as Record<string, unknown> | null;
  if (!data) return "—";
  if (typeof data.title === "string" && data.title) return data.title;
  if (typeof data.headline === "string" && data.headline) return data.headline;
  if (block.type === "spacer") return "Visual spacer";
  if (block.type === "social_row") {
    const links = Array.isArray((data as { links?: unknown[] }).links)
      ? (data as { links: unknown[] }).links.length
      : 0;
    return `${links} platform${links === 1 ? "" : "s"}`;
  }
  return "—";
}
