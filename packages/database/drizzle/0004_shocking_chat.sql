ALTER TABLE "sites" ADD COLUMN "allowed_domains" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_protection" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sites" DROP COLUMN "domain";