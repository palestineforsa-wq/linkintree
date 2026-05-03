-- ============================================================================
-- 0001 — auth.users FKs, indexes, unique constraints, and RLS.
-- Hand-written; Drizzle Kit doesn't manage cross-schema FKs, partial indexes,
-- or RLS. Per spec §4 indexes and §10 security checklist.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FKs to auth.users (Supabase manages auth.users; Drizzle schema can't reference it)
-- ----------------------------------------------------------------------------
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE "subscriptions"
  ADD CONSTRAINT "subscriptions_user_id_auth_users_fk"
  FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- Indexes (per spec §4)
-- ----------------------------------------------------------------------------
-- profiles(username) — every public page hits this; uniqueness already covers it,
-- but we want a btree on lower-cased citext for fast equality lookups.
CREATE INDEX IF NOT EXISTS "idx_profiles_username" ON "profiles" ("username");
--> statement-breakpoint

-- blocks(profile_id, position) WHERE is_active = true — public render path
CREATE INDEX IF NOT EXISTS "idx_blocks_active_ordered"
  ON "blocks" ("profile_id", "position")
  WHERE "is_active" = true;
--> statement-breakpoint

-- clicks(profile_id, occurred_at DESC)
CREATE INDEX IF NOT EXISTS "idx_clicks_profile_time"
  ON "clicks" ("profile_id", "occurred_at" DESC);
--> statement-breakpoint

-- clicks(block_id, occurred_at DESC)
CREATE INDEX IF NOT EXISTS "idx_clicks_block_time"
  ON "clicks" ("block_id", "occurred_at" DESC);
--> statement-breakpoint

-- page_views(profile_id, occurred_at DESC) — same pattern, different table
CREATE INDEX IF NOT EXISTS "idx_page_views_profile_time"
  ON "page_views" ("profile_id", "occurred_at" DESC);
--> statement-breakpoint

-- email_captures(profile_id, email) UNIQUE — one capture per profile per address
ALTER TABLE "email_captures"
  ADD CONSTRAINT "email_captures_profile_email_unique"
  UNIQUE ("profile_id", "email");
--> statement-breakpoint

-- ----------------------------------------------------------------------------
-- RLS — enabled on every table (spec §10 checkbox 1)
-- All anon mutations are denied; service_role bypasses RLS.
-- App writes go through Server Actions; analytics writes use service_role.
-- ----------------------------------------------------------------------------
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clicks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "page_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_captures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reserved_usernames" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "processed_webhooks" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- profiles: public-readable (link-in-bio is inherently public); owner mutates own.
CREATE POLICY "profiles_anon_read"
  ON "profiles" FOR SELECT
  TO anon, authenticated
  USING (true);
--> statement-breakpoint

CREATE POLICY "profiles_owner_insert"
  ON "profiles" FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
--> statement-breakpoint

CREATE POLICY "profiles_owner_update"
  ON "profiles" FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
--> statement-breakpoint

CREATE POLICY "profiles_owner_delete"
  ON "profiles" FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id);
--> statement-breakpoint

-- blocks: anon sees only active blocks; owner has full CRUD on their own.
CREATE POLICY "blocks_anon_read_active"
  ON "blocks" FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
--> statement-breakpoint

CREATE POLICY "blocks_owner_read_all"
  ON "blocks" FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

CREATE POLICY "blocks_owner_insert"
  ON "blocks" FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

CREATE POLICY "blocks_owner_update"
  ON "blocks" FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

CREATE POLICY "blocks_owner_delete"
  ON "blocks" FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

-- clicks: owner reads own; no anon/authenticated writes (service_role inserts).
CREATE POLICY "clicks_owner_read"
  ON "clicks" FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

-- page_views: same pattern as clicks.
CREATE POLICY "page_views_owner_read"
  ON "page_views" FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

-- subscriptions: owner reads own; webhook writes via service_role only.
CREATE POLICY "subscriptions_owner_read"
  ON "subscriptions" FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
--> statement-breakpoint

-- email_captures: owner reads own; writes via Server Action using service_role.
CREATE POLICY "email_captures_owner_read"
  ON "email_captures" FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = profile_id);
--> statement-breakpoint

-- reserved_usernames: anyone can read (signup form needs it for availability).
CREATE POLICY "reserved_usernames_anon_read"
  ON "reserved_usernames" FOR SELECT
  TO anon, authenticated
  USING (true);
--> statement-breakpoint

-- processed_webhooks: no policies — only service_role accesses (RLS denies all).
