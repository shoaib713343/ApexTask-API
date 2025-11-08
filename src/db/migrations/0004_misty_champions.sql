CREATE TABLE "lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"rank" integer NOT NULL,
	"board_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;