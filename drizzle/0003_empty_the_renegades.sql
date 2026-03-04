-- Add email column: first as nullable, backfill, then set NOT NULL
ALTER TABLE "user_invite" ADD COLUMN IF NOT EXISTS "email" varchar(255);
UPDATE "user_invite" SET "email" = '' WHERE "email" IS NULL;
ALTER TABLE "user_invite" ALTER COLUMN "email" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_invite" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'content_editor' NOT NULL;