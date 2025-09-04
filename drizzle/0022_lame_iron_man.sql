CREATE TABLE "gated_document_lead" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "is_gated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "gated_document_lead" ADD CONSTRAINT "gated_document_lead_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;