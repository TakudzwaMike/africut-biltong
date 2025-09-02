ALTER TABLE "media" RENAME COLUMN "url" TO "original_url";--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "width" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "height" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "display_url" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "blur_data_url" text;