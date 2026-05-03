CREATE EXTENSION IF NOT EXISTS "citext";--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('link', 'header', 'embed', 'product', 'email_capture', 'social_row', 'video', 'spacer');--> statement-breakpoint
CREATE TYPE "public"."device_kind" AS ENUM('mobile', 'tablet', 'desktop', 'bot');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'pro_yearly');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'canceled', 'incomplete');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"position" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"data" jsonb NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"block_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"country" text,
	"device" "device_kind",
	"browser" text,
	"visitor_hash" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_captures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"email" "citext" NOT NULL,
	"source_block_id" uuid,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_views" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"country" text,
	"device" "device_kind",
	"browser" text,
	"visitor_hash" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "processed_webhooks" (
	"event_id" text PRIMARY KEY NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" "citext" NOT NULL,
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"theme" jsonb,
	"seo_title" text,
	"seo_description" text,
	"og_image_url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_nsfw" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reserved_usernames" (
	"username" "citext" PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" "subscription_status" NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blocks" ADD CONSTRAINT "blocks_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clicks" ADD CONSTRAINT "clicks_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clicks" ADD CONSTRAINT "clicks_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_captures" ADD CONSTRAINT "email_captures_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_captures" ADD CONSTRAINT "email_captures_source_block_id_blocks_id_fk" FOREIGN KEY ("source_block_id") REFERENCES "public"."blocks"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_views" ADD CONSTRAINT "page_views_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
