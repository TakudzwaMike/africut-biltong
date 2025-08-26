CREATE TABLE "page_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" varchar(255) NOT NULL,
	"section" varchar(255) NOT NULL,
	"title" varchar(255),
	"text" text,
	"media_id" integer,
	CONSTRAINT "page_content_section_unique" UNIQUE("section")
);
--> statement-breakpoint
ALTER TABLE "page_content" ADD CONSTRAINT "page_content_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;