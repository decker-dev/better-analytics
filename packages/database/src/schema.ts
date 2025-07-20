import { pgTable, text, integer, timestamp, boolean, unique, jsonb, index } from 'drizzle-orm/pg-core';
// === NORMALIZED ANALYTICS SCHEMA ===

// Base events table - core data only
export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  site: text('site').notNull().references(() => sites.siteKey, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  event: text('event').notNull(),
  url: text('url'),
  referrer: text('referrer'),
  sessionId: text('sessionId'),
  deviceId: text('deviceId'),
  userId: text('userId'),
  props: jsonb('props').$type<Record<string, unknown>>(),
  createdAt: timestamp('createdAt').defaultNow(),
}, (table) => ({
  // Core indexes for base queries
  siteTimestampIdx: index('events_site_timestamp_idx').on(table.site, table.timestamp.desc()),
  siteEventIdx: index('events_site_event_idx').on(table.site, table.event),
  sessionIdx: index('events_session_idx').on(table.sessionId),
  deviceIdx: index('events_device_idx').on(table.deviceId),
  userIdx: index('events_user_idx').on(table.userId),
  timestampIdx: index('events_timestamp_idx').on(table.timestamp),
}));

// Web-specific data
export const webEvents = pgTable('web_events', {
  eventId: text('event_id').primaryKey().references(() => events.id, { onDelete: 'cascade' }),

  // User Agent parsed data
  userAgent: text('user_agent'),
  browser: text('browser'),
  os: text('os'),
  device: text('device'),
  deviceVendor: text('device_vendor'),
  deviceModel: text('device_model'),
  engine: text('engine'),
  cpu: text('cpu'),

  // Page context
  pageTitle: text('page_title'),
  pathname: text('pathname'),
  hostname: text('hostname'),
  loadTime: integer('load_time'),

  // UTM parameters
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),

  // Screen/viewport
  screenWidth: integer('screen_width'),
  screenHeight: integer('screen_height'),
  viewportWidth: integer('viewport_width'),
  viewportHeight: integer('viewport_height'),

  // Web-specific
  language: text('language'),
  timezone: text('timezone'),
  connectionType: text('connection_type'),
}, (table) => ({
  pathnameIdx: index('web_events_pathname_idx').on(table.pathname),
  utmSourceIdx: index('web_events_utm_source_idx').on(table.utmSource),
}));

// Mobile-specific data
export const mobileEvents = pgTable('mobile_events', {
  eventId: text('event_id').primaryKey().references(() => events.id, { onDelete: 'cascade' }),

  // Mobile device info
  platform: text('platform'), // ios, android
  platformVersion: text('platform_version'),
  brand: text('brand'),
  model: text('model'),
  isEmulator: boolean('is_emulator'),

  // App info
  appVersion: text('app_version'),
  appBuildNumber: text('app_build_number'),
  bundleId: text('bundle_id'),

  // Mobile-specific context
  language: text('language'),
  timezone: text('timezone'),
  screenWidth: integer('screen_width'),
  screenHeight: integer('screen_height'),
}, (table) => ({
  platformIdx: index('mobile_events_platform_idx').on(table.platform),
  appVersionIdx: index('mobile_events_app_version_idx').on(table.appVersion),
}));

// Server-side events data
export const serverEvents = pgTable('server_events', {
  eventId: text('event_id').primaryKey().references(() => events.id, { onDelete: 'cascade' }),

  // Server context
  runtime: text('runtime'), // node, edge, cloudflare, deno
  framework: text('framework'), // nextjs, vercel, netlify
  serverIP: text('server_ip'),
  origin: text('origin'),
  userAgent: text('user_agent'),
}, (table) => ({
  runtimeIdx: index('server_events_runtime_idx').on(table.runtime),
  frameworkIdx: index('server_events_framework_idx').on(table.framework),
}));

// Geographic data (shared across all event types)
export const geoEvents = pgTable('geo_events', {
  eventId: text('event_id').primaryKey().references(() => events.id, { onDelete: 'cascade' }),

  // Geographic info
  country: text('country'),
  region: text('region'),
  city: text('city'),
  latitude: text('latitude'),
  longitude: text('longitude'),
}, (table) => ({
  countryIdx: index('geo_events_country_idx').on(table.country),
  regionIdx: index('geo_events_region_idx').on(table.region),
}));

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const session = pgTable('session', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  activeOrganizationId: text('activeOrganizationId'),
});

export const account = pgTable('account', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()),
});

// Organization plugin tables
export const organization = pgTable('organization', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const member = pgTable('member', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organizationId').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  inviterId: text('inviterId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organizationId').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  status: text('status').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const sites = pgTable('sites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),                    // "Mi Dashboard", "Blog Personal", "Demo Site"
  slug: text('slug').notNull(),                    // "mi-dashboard", "blog-personal" (URL-friendly, unique per org)
  siteKey: text('site_key').notNull().unique(),    // "BA_231", "BA_456" (identificador único para tracking Y para URLs /start/[siteKey])
  organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }), // Null para sites temporales
  allowedDomains: jsonb('allowed_domains').$type<string[]>(),          // JSON array: ["example.com", "subdomain.example.com"]
  domainProtection: boolean('domain_protection').default(false), // Feature flag para protección por dominio
  description: text('description'),                 // Descripción del proyecto

  // Campos para sites temporales
  isTemp: boolean('is_temp').default(false),       // true para sites temporales
  expiresAt: timestamp('expires_at'),              // Solo para sites temporales

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  // Slug único por organización
  uniqueSlugPerOrg: unique().on(table.organizationId, table.slug),
}));

// TypeScript types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type WebEvent = typeof webEvents.$inferSelect;
export type NewWebEvent = typeof webEvents.$inferInsert;

export type MobileEvent = typeof mobileEvents.$inferSelect;
export type NewMobileEvent = typeof mobileEvents.$inferInsert;

export type ServerEvent = typeof serverEvents.$inferSelect;
export type NewServerEvent = typeof serverEvents.$inferInsert;

export type GeoEvent = typeof geoEvents.$inferSelect;
export type NewGeoEvent = typeof geoEvents.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;

