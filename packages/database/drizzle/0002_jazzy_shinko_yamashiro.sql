ALTER TABLE "events" DROP CONSTRAINT "events_site_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_site_sites_site_key_fk" FOREIGN KEY ("site") REFERENCES "public"."sites"("site_key") ON DELETE cascade ON UPDATE no action;