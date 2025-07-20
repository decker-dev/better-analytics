ALTER TABLE "sites" DROP CONSTRAINT "sites_slug_unique";--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_organization_id_slug_unique" UNIQUE("organization_id","slug");