CREATE TYPE "public"."product_type" AS ENUM('physical', 'service', 'digital');--> statement-breakpoint
CREATE TABLE "order" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"total_amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"quantity" integer NOT NULL,
	"price_at_purchase" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "type" "product_type" DEFAULT 'physical' NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "prices" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "stock_quantity" integer;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;