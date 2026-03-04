-- Catch-all migration: ensure all tables exist regardless of journal state
-- This handles cases where previous migrations were recorded as "applied"
-- but tables weren't actually created (schema desync from prior failures).

-- Tables from migration 0001
CREATE TABLE IF NOT EXISTS "discount_code" (
	"id" text PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" "discount_type" NOT NULL,
	"value" integer NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"min_order_amount" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "discount_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sale_event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"public_label" text,
	"banner_text" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sale_price" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"sale_price_usd" integer,
	"sale_price_zar" integer
);
--> statement-breakpoint
-- Columns from migration 0001
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "subtotal" integer;
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "discount_code_id" text;
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "discount_amount" integer DEFAULT 0;
--> statement-breakpoint
-- FKs from migration 0001
DO $$ BEGIN
    ALTER TABLE "sale_price" ADD CONSTRAINT "sale_price_event_id_sale_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."sale_event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "sale_price" ADD CONSTRAINT "sale_price_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "order" ADD CONSTRAINT "order_discount_code_id_discount_code_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_code"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- Tables from migration 0002
CREATE TABLE IF NOT EXISTS "currency_rate" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_email" varchar(255),
	"default_markup" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"supplier_sku" varchar(100),
	"raw_price" integer NOT NULL,
	"is_on_file" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Columns from migration 0002
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "approval_status" varchar(50) DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "shipping_flat_rate" integer DEFAULT 0;
--> statement-breakpoint
-- FKs from migration 0002
ALTER TABLE "product_supplier" ADD COLUMN IF NOT EXISTS "variant_id" text NOT NULL;
DO $$ BEGIN
    ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
ALTER TABLE "product_supplier" ADD COLUMN IF NOT EXISTS "supplier_id" integer NOT NULL;
DO $$ BEGIN
    ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
-- Columns from migration 0003
ALTER TABLE "user_invite" ADD COLUMN IF NOT EXISTS "email" varchar(255);
UPDATE "user_invite" SET "email" = '' WHERE "email" IS NULL;
ALTER TABLE "user_invite" ALTER COLUMN "email" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_invite" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'content_editor' NOT NULL;
