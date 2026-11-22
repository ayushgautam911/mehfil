ALTER TABLE "events" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "address_reveal_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "lineup" text[];--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "genres" text[];