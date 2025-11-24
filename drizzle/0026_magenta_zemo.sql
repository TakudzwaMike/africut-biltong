CREATE TABLE "solutions_to_products" (
	"solution_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "solutions_to_products_solution_id_product_id_pk" PRIMARY KEY("solution_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "solutions_to_products" ADD CONSTRAINT "solutions_to_products_solution_id_solution_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solution"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions_to_products" ADD CONSTRAINT "solutions_to_products_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;