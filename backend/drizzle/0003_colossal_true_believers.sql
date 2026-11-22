ALTER TABLE "events" ADD COLUMN "end_time" varchar(50);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "venue_address" varchar(300);--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "image_url" text;