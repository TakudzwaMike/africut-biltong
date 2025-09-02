ALTER TABLE "solution" ADD COLUMN "media_id" integer;--> statement-breakpoint
ALTER TABLE "solution" ADD CONSTRAINT "solution_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution" DROP COLUMN "image_url";