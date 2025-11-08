CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" text,
	"password" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
