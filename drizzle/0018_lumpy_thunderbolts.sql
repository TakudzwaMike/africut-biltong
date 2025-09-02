ALTER TABLE "client" ADD COLUMN "media_id" integer;--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client" DROP COLUMN "logo_url";