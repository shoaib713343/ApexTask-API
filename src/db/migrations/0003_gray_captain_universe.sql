CREATE TABLE "boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"organization_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;