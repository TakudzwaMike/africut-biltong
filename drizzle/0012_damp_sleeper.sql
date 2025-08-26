CREATE TABLE "blog_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "blog_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts_to_categories" (
	"post_id" integer NOT NULL,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_posts_to_categories" ADD CONSTRAINT "blog_posts_to_categories_post_id_blog_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts_to_categories" ADD CONSTRAINT "blog_posts_to_categories_category_id_blog_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_category"("id") ON DELETE cascade ON UPDATE no action;