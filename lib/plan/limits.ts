import type { BlockType } from "@/lib/blocks/schemas";

export type Plan = "free" | "pro" | "pro_yearly";

type PlanLimits = {
  activeBlocks: number;
  blockTypes: readonly BlockType[] | "all";
  themePresetsOnly: boolean;
  customCss: boolean;
  poweredByFooter: boolean;
  analyticsHistoryDays: number;
  emailCapturesExportLimit: number;
  blockScheduling: boolean;
  customOgImage: boolean;
  verifiedBadgeEligible: boolean;
};

export const FREE_LIMITS: PlanLimits = {
  activeBlocks: 5,
  blockTypes: ["link", "header", "social_row", "spacer"],
  themePresetsOnly: true,
  customCss: false,
  poweredByFooter: true,
  analyticsHistoryDays: 7,
  emailCapturesExportLimit: 25,
  blockScheduling: false,
  customOgImage: false,
  verifiedBadgeEligible: false,
};

export const PRO_LIMITS: PlanLimits = {
  activeBlocks: Number.POSITIVE_INFINITY,
  blockTypes: "all",
  themePresetsOnly: false,
  customCss: true,
  poweredByFooter: false,
  analyticsHistoryDays: 365 * 10,
  emailCapturesExportLimit: Number.POSITIVE_INFINITY,
  blockScheduling: true,
  customOgImage: true,
  verifiedBadgeEligible: true,
};

export const LIMITS: Record<Plan, PlanLimits> = {
  free: FREE_LIMITS,
  pro: PRO_LIMITS,
  pro_yearly: PRO_LIMITS,
};
