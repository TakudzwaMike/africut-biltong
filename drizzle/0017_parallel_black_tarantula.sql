ALTER TABLE "product" ADD COLUMN "media_id" integer;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "image_url";