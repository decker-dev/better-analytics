import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  site: text('site').notNull(),
  ts: text('ts').notNull(),
  evt: text('evt').notNull(),
  url: text('url'),
  ref: text('ref'),
  props: text('props'),

  // User Agent information (parsed)
  userAgent: text('userAgent'), // Raw user agent string
  browser: text('browser'), // e.g., "Chrome 120.0"
  os: text('os'), // e.g., "macOS 14.1"
  device: text('device'), // e.g., "desktop", "mobile", "tablet"
  deviceVendor: text('deviceVendor'), // e.g., "Apple", "Samsung"
  deviceModel: text('deviceModel'), // e.g., "iPhone", "MacBook Pro"
  engine: text('engine'), // e.g., "Blink", "WebKit"
  cpu: text('cpu'), // e.g., "amd64", "arm64"

  // Geographic information (if available)
  country: text('country'), // e.g., "US", "ES"
  region: text('region'), // e.g., "California", "Madrid"
  city: text('city'), // e.g., "San Francisco", "Madrid"

  // Session information
  sessionId: text('sessionId'), // To group events by session
  userId: text('userId'), // If user is identified

  // Page information
  pageTitle: text('pageTitle'), // Page title
  pathname: text('pathname'), // Just the path part of URL
  hostname: text('hostname'), // Just the hostname

  // Performance metrics (optional)
  loadTime: integer('loadTime'), // Page load time in ms

  // UTM parameters for marketing attribution
  utmSource: text('utmSource'),
  utmMedium: text('utmMedium'),
  utmCampaign: text('utmCampaign'),
  utmTerm: text('utmTerm'),
  utmContent: text('utmContent'),

  // Screen resolution
  screenWidth: integer('screenWidth'),
  screenHeight: integer('screenHeight'),

  // Viewport size
  viewportWidth: integer('viewportWidth'),
  viewportHeight: integer('viewportHeight'),

  // Language
  language: text('language'), // e.g., "en-US", "es-ES"

  // Timestamps
  createdAt: timestamp('createdAt').defaultNow(),
});

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
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
  id: text('id').primaryKey(),
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
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()),
});

// Organization plugin tables
export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const member = pgTable('member', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organizationId').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

export const invitation = pgTable('invitation', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  inviterId: text('inviterId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organizationId').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  status: text('status').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().$onUpdate(() => new Date()),
});

// Sites table for project management
export const sites = pgTable('sites', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),                    // "Mi Dashboard", "Blog Personal"
  siteKey: text('site_key').notNull().unique(),    // "BA_231", "BA_456" (identificador único)
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  domain: text('domain'),                           // "dashboard.example.com" (opcional)
  description: text('description'),                 // Descripción del proyecto
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// TypeScript types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert; 