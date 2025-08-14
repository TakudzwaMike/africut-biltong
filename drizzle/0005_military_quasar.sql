CREATE TABLE "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_name" varchar(255) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"address" text NOT NULL
);
