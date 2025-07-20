ALTER TABLE "events" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deviceId" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "connectionType" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "platform" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "platformVersion" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "isEmulator" boolean;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "appVersion" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "appBuildNumber" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "bundleId" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "serverRuntime" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "serverFramework" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "serverIP" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "serverOrigin" text;