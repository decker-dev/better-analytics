CREATE TABLE "geo_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"country" text,
	"region" text,
	"city" text,
	"latitude" text,
	"longitude" text
);
--> statement-breakpoint
CREATE TABLE "mobile_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"platform" text,
	"platform_version" text,
	"brand" text,
	"model" text,
	"is_emulator" boolean,
	"app_version" text,
	"app_build_number" text,
	"bundle_id" text,
	"language" text,
	"timezone" text,
	"screen_width" integer,
	"screen_height" integer
);
--> statement-breakpoint
CREATE TABLE "server_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"runtime" text,
	"framework" text,
	"server_ip" text,
	"origin" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "web_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"user_agent" text,
	"browser" text,
	"os" text,
	"device" text,
	"device_vendor" text,
	"device_model" text,
	"engine" text,
	"cpu" text,
	"page_title" text,
	"pathname" text,
	"hostname" text,
	"load_time" integer,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"screen_width" integer,
	"screen_height" integer,
	"viewport_width" integer,
	"viewport_height" integer,
	"language" text,
	"timezone" text,
	"connection_type" text
);
--> statement-breakpoint
DROP INDEX "events_site_pathname_idx";--> statement-breakpoint
DROP INDEX "events_site_country_idx";--> statement-breakpoint
DROP INDEX "events_site_utm_source_idx";--> statement-breakpoint
DROP INDEX "events_analytics_idx";--> statement-breakpoint
DROP INDEX "events_site_timestamp_idx";--> statement-breakpoint
DROP INDEX "events_site_event_idx";--> statement-breakpoint
DROP INDEX "events_timestamp_idx";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "props" SET DATA TYPE jsonb USING props::jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "timestamp" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event" text NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "geo_events" ADD CONSTRAINT "geo_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_events" ADD CONSTRAINT "mobile_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_events" ADD CONSTRAINT "server_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_events" ADD CONSTRAINT "web_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "geo_events_country_idx" ON "geo_events" USING btree ("country");--> statement-breakpoint
CREATE INDEX "geo_events_region_idx" ON "geo_events" USING btree ("region");--> statement-breakpoint
CREATE INDEX "mobile_events_platform_idx" ON "mobile_events" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "mobile_events_app_version_idx" ON "mobile_events" USING btree ("app_version");--> statement-breakpoint
CREATE INDEX "server_events_runtime_idx" ON "server_events" USING btree ("runtime");--> statement-breakpoint
CREATE INDEX "server_events_framework_idx" ON "server_events" USING btree ("framework");--> statement-breakpoint
CREATE INDEX "web_events_pathname_idx" ON "web_events" USING btree ("pathname");--> statement-breakpoint
CREATE INDEX "web_events_utm_source_idx" ON "web_events" USING btree ("utm_source");--> statement-breakpoint
CREATE INDEX "events_site_timestamp_idx" ON "events" USING btree ("site","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "events_site_event_idx" ON "events" USING btree ("site","event");--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" USING btree ("timestamp");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "ts";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "evt";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "ref";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "userAgent";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "browser";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "os";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "device";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "deviceVendor";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "deviceModel";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "engine";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "cpu";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "region";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "pageTitle";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "pathname";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "hostname";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "loadTime";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "utmSource";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "utmMedium";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "utmCampaign";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "utmTerm";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "utmContent";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "screenWidth";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "screenHeight";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "viewportWidth";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "viewportHeight";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "language";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "connectionType";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "platformVersion";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "brand";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "model";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "isEmulator";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "appVersion";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "appBuildNumber";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "bundleId";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "serverRuntime";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "serverFramework";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "serverIP";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "serverOrigin";