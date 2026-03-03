ALTER TABLE "user_invite" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invite" ADD COLUMN "role" "user_role" DEFAULT 'content_editor' NOT NULL;