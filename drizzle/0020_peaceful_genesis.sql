CREATE TABLE "link_visit" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"ip_country" varchar(2),
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracked_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_code" varchar(255) NOT NULL,
	"destination_url" text NOT NULL,
	"description" varchar(255),
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tracked_link_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
ALTER TABLE "link_visit" ADD CONSTRAINT "link_visit_link_id_tracked_link_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."tracked_link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_link" ADD CONSTRAINT "tracked_link_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;