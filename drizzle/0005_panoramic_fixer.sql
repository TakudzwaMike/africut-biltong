ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "profile_image_id" integer;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "user" ADD CONSTRAINT "user_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;