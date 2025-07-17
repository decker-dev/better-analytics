CREATE INDEX "events_site_timestamp_idx" ON "events" USING btree ("site","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "events_site_event_idx" ON "events" USING btree ("site","evt");--> statement-breakpoint
CREATE INDEX "events_session_idx" ON "events" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "events_device_idx" ON "events" USING btree ("deviceId");--> statement-breakpoint
CREATE INDEX "events_user_idx" ON "events" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "events_site_pathname_idx" ON "events" USING btree ("site","pathname");--> statement-breakpoint
CREATE INDEX "events_site_country_idx" ON "events" USING btree ("site","country");--> statement-breakpoint
CREATE INDEX "events_site_utm_source_idx" ON "events" USING btree ("site","utmSource");--> statement-breakpoint
CREATE INDEX "events_analytics_idx" ON "events" USING btree ("site","evt","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" USING btree ("createdAt");