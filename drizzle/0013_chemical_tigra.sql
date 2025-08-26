CREATE TABLE "team_member" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"bio" text,
	"media_id" integer
);
--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;