// Drizzle schema — MYWEB-3 will fill these out with full constraints, RLS,
// and migrations. This file establishes the spine per spec §4.

import {
  bigserial,
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const blockTypeEnum = pgEnum("block_type", [
  "link",
  "header",
  "embed",
  "product",
  "email_capture",
  "social_row",
  "video",
  "spacer",
]);

export const deviceEnum = pgEnum("device_kind", [
  "mobile",
  "tablet",
  "desktop",
  "bot",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
]);

export const planEnum = pgEnum("plan", ["free", "pro", "pro_yearly"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  username: citext("username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  theme: jsonb("theme"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isNsfw: boolean("is_nsfw").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  type: blockTypeEnum("type").notNull(),
  position: integer("position").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  data: jsonb("data").notNull(), // validated per-type with Zod, never trusted raw
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => blocks.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  referrer: text("referrer"),
  country: text("country"),
  device: deviceEnum("device"),
  browser: text("browser"),
  visitorHash: text("visitor_hash"),
});

export const pageViews = pgTable("page_views", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  referrer: text("referrer"),
  country: text("country"),
  device: deviceEnum("device"),
  browser: text("browser"),
  visitorHash: text("visitor_hash"),
});

export const subscriptions = pgTable("subscriptions", {
  userId: uuid("user_id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
});

export const emailCaptures = pgTable("email_captures", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  email: citext("email").notNull(),
  sourceBlockId: uuid("source_block_id").references(() => blocks.id, {
    onDelete: "set null",
  }),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reservedUsernames = pgTable("reserved_usernames", {
  username: citext("username").primaryKey(),
});

export const processedWebhooks = pgTable("processed_webhooks", {
  eventId: text("event_id").primaryKey(),
  processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type BlockInsert = typeof blocks.$inferInsert;
