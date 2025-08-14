CREATE TABLE "client" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo_url" text,
	CONSTRAINT "client_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "case_study" ADD COLUMN "client_id" integer;--> statement-breakpoint
ALTER TABLE "case_study" ADD CONSTRAINT "case_study_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study" DROP COLUMN "client_name";