"use server";

import { and, eq, max, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { blocks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/server";
import { revalidateOwnerSurfaces } from "./_revalidate";
import {
  blockSchemas,
  BLOCK_TYPES,
  type BlockType,
} from "@/lib/blocks/schemas";
import { BLOCK_REGISTRY } from "@/lib/blocks/registry";
import {
  canAddBlock,
  canUseBlockType,
  getPlan,
} from "@/lib/plan/gates";

export type BlockActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const idSchema = z.string().uuid();
const blockTypeSchema = z.enum(BLOCK_TYPES);

// ----------------------------------------------------------------------------
// create
// ----------------------------------------------------------------------------
export async function createBlockAction(
  type: BlockType,
): Promise<BlockActionResult<{ id: string }>> {
  const user = await requireUser();

  const typeResult = blockTypeSchema.safeParse(type);
  if (!typeResult.success) return { ok: false, error: "Unknown block type." };

  const limit = await canAddBlock(user.id);
  if (!limit.allowed) {
    return { ok: false, error: "Block limit reached. Upgrade to add more." };
  }

  const typeGate = await canUseBlockType(user.id, type);
  if (!typeGate.allowed) {
    return { ok: false, error: "This block type requires Pro." };
  }

  const meta = BLOCK_REGISTRY[type];

  // position = max(position) + 1
  const [{ value: maxPos } = { value: -1 }] = await db
    .select({ value: max(blocks.position) })
    .from(blocks)
    .where(eq(blocks.profileId, user.id));

  const [inserted] = await db
    .insert(blocks)
    .values({
      profileId: user.id,
      type,
      position: (maxPos ?? -1) + 1,
      isActive: true,
      data: meta.defaultData,
    })
    .returning({ id: blocks.id });

  await revalidateOwnerSurfaces(user.id);
  return { ok: true, data: { id: inserted!.id } };
}

// ----------------------------------------------------------------------------
// update — partial data update; we re-validate the whole payload per type
// ----------------------------------------------------------------------------
export async function updateBlockAction({
  id,
  data,
}: {
  id: string;
  data: unknown;
}): Promise<BlockActionResult> {
  const user = await requireUser();

  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid block id." };
  }

  const [existing] = await db
    .select({ type: blocks.type })
    .from(blocks)
    .where(and(eq(blocks.id, id), eq(blocks.profileId, user.id)))
    .limit(1);
  if (!existing) return { ok: false, error: "Not found." };

  const parsed = blockSchemas[existing.type as BlockType].safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid block data.",
    };
  }

  await db
    .update(blocks)
    .set({ data: parsed.data, updatedAt: new Date() })
    .where(and(eq(blocks.id, id), eq(blocks.profileId, user.id)));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// delete
// ----------------------------------------------------------------------------
export async function deleteBlockAction(
  id: string,
): Promise<BlockActionResult> {
  const user = await requireUser();
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid block id." };
  }

  await db
    .delete(blocks)
    .where(and(eq(blocks.id, id), eq(blocks.profileId, user.id)));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// toggle is_active — gates against Free's 5-active-block cap
// ----------------------------------------------------------------------------
export async function toggleBlockActiveAction({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}): Promise<BlockActionResult> {
  const user = await requireUser();
  if (!idSchema.safeParse(id).success) {
    return { ok: false, error: "Invalid block id." };
  }

  if (isActive) {
    // about to activate — check limit
    const limit = await canAddBlock(user.id);
    if (!limit.allowed) {
      return { ok: false, error: "Active-block limit reached." };
    }
  }

  await db
    .update(blocks)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(blocks.id, id), eq(blocks.profileId, user.id)));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// reorder — atomic re-numbering by full ordered id list
// ----------------------------------------------------------------------------
const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(500),
});

export async function reorderBlocksAction(
  input: unknown,
): Promise<BlockActionResult> {
  const user = await requireUser();
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const { orderedIds } = parsed.data;

  // Confirm all ids belong to the user — refuse the whole op otherwise.
  const owned = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(eq(blocks.profileId, user.id));
  const ownedSet = new Set(owned.map((r) => r.id));
  if (!orderedIds.every((id) => ownedSet.has(id))) {
    return { ok: false, error: "Not authorized for one or more blocks." };
  }

  // Build a single CASE expression so the whole reorder is one UPDATE.
  const cases = orderedIds.map(
    (id, i) => sql`when ${blocks.id} = ${id} then ${i}`,
  );
  await db
    .update(blocks)
    .set({
      position: sql`case ${sql.join(cases, sql` `)} end`,
      updatedAt: new Date(),
    })
    .where(eq(blocks.profileId, user.id));

  await revalidateOwnerSurfaces(user.id);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// listOwn — used by the dashboard server component
// ----------------------------------------------------------------------------
export async function listOwnBlocks() {
  const user = await requireUser();
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.profileId, user.id))
    .orderBy(blocks.position);
}

export async function getDashboardContext() {
  const user = await requireUser();
  const [ownBlocks, plan] = await Promise.all([
    db
      .select()
      .from(blocks)
      .where(eq(blocks.profileId, user.id))
      .orderBy(blocks.position),
    getPlan(user.id),
  ]);
  return { user, blocks: ownBlocks, plan };
}
