CREATE TABLE "user_invite" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_by" text,
	CONSTRAINT "user_invite_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "user_invite" ADD CONSTRAINT "user_invite_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;