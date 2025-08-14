CREATE TYPE "public"."testimonial_status" AS ENUM('pending', 'submitted', 'published', 'rejected');--> statement-breakpoint
CREATE TABLE "testimonial" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"quote" text,
	"author_name" varchar(255),
	"author_title" varchar(255),
	"status" "testimonial_status" DEFAULT 'pending' NOT NULL,
	"submission_token" text NOT NULL,
	"token_expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "testimonial_submission_token_unique" UNIQUE("submission_token")
);
--> statement-breakpoint
ALTER TABLE "lead" ADD COLUMN "solution_id" integer;--> statement-breakpoint
ALTER TABLE "solution" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "testimonial" ADD CONSTRAINT "testimonial_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_solution_id_solution_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solution"("id") ON DELETE set null ON UPDATE no action;