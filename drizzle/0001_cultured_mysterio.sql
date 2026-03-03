DO $$ BEGIN
    CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
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
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "subtotal" integer;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "discount_code_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "discount_amount" integer DEFAULT 0;--> statement-breakpoint
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