CREATE TABLE "currency_rate" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"supplier_sku" varchar(100),
	"raw_price" integer NOT NULL,
	"is_on_file" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_email" varchar(255),
	"default_markup" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "approval_status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "shipping_flat_rate" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_supplier" ADD CONSTRAINT "product_supplier_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE cascade ON UPDATE no action;