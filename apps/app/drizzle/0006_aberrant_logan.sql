ALTER TABLE "temp_sites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "temp_sites" CASCADE;--> statement-breakpoint
ALTER TABLE "sites" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "is_temp" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "expires_at" timestamp;