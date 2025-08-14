CREATE TABLE "case_study" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"client_name" varchar(255),
	"challenge" jsonb NOT NULL,
	"solution" jsonb NOT NULL,
	CONSTRAINT "case_study_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "case_study_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_study_id" integer NOT NULL,
	"kpi_name" varchar(255) NOT NULL,
	"kpi_value" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solution" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"solution_name" varchar(255) NOT NULL,
	"short_description" text,
	"long_description" jsonb,
	CONSTRAINT "solution_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "case_study_result" ADD CONSTRAINT "case_study_result_case_study_id_case_study_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."case_study"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;