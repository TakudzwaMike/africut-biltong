CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"image_url" text,
	"short_description" text,
	"long_description" jsonb,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
