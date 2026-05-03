import type { BlockType } from "@/lib/blocks/schemas";
import { LIMITS, type Plan } from "./limits";

export type GateResult =
  | { allowed: true }
  | { allowed: false; reason: GateReason; upgradeTo?: "pro" };

export type GateReason =
  | "block_limit"
  | "block_type_locked"
  | "theme_locked"
  | "custom_css_locked"
  | "scheduling_locked"
  | "og_image_locked"
  | "export_limit";

// All consumers go through these. Never read subscription.plan directly in a
// component. The server action MUST also re-check; never trust the client.

export async function getPlan(_userId: string): Promise<Plan> {
  // TODO MYWEB-8: read from subscriptions table
  return "free";
}

async function countActiveBlocks(_userId: string): Promise<number> {
  // TODO MYWEB-5: SELECT count(*) FROM blocks WHERE profile_id = $1 AND is_active
  return 0;
}

export async function canAddBlock(userId: string): Promise<GateResult> {
  const plan = await getPlan(userId);
  const count = await countActiveBlocks(userId);
  const limit = LIMITS[plan].activeBlocks;
  return count < limit
    ? { allowed: true }
    : { allowed: false, reason: "block_limit", upgradeTo: "pro" };
}

export async function canUseBlockType(
  userId: string,
  type: BlockType,
): Promise<GateResult> {
  const plan = await getPlan(userId);
  const allowed = LIMITS[plan].blockTypes;
  if (allowed === "all" || allowed.includes(type)) return { allowed: true };
  return { allowed: false, reason: "block_type_locked", upgradeTo: "pro" };
}

export async function canCustomizeTheme(userId: string): Promise<GateResult> {
  const plan = await getPlan(userId);
  return LIMITS[plan].themePresetsOnly
    ? { allowed: false, reason: "theme_locked", upgradeTo: "pro" }
    : { allowed: true };
}

export async function canScheduleBlocks(userId: string): Promise<GateResult> {
  const plan = await getPlan(userId);
  return LIMITS[plan].blockScheduling
    ? { allowed: true }
    : { allowed: false, reason: "scheduling_locked", upgradeTo: "pro" };
}
