CREATE TABLE "temp_sites" (
	"id" text PRIMARY KEY NOT NULL,
	"site_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "temp_sites_site_key_unique" UNIQUE("site_key")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_temp" boolean DEFAULT false;