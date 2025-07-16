import { z } from 'zod';

// Device info schema
export const deviceInfoSchema = z.object({
  userAgent: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  connectionType: z.string().optional(),
}).optional();

// Page info schema
export const pageInfoSchema = z.object({
  title: z.string().optional(),
  pathname: z.string().optional(),
  hostname: z.string().optional(),
  loadTime: z.number().optional(),
}).optional();

// UTM parameters schema
export const utmParamsSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
}).optional();

// Server info schema (for server-side events)
export const serverInfoSchema = z.object({
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  referer: z.string().optional(),
  origin: z.string().optional(),
  runtime: z.string().optional(),
  framework: z.string().optional(),
}).optional();

// User info schema (for server-side events)
export const userInfoSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
}).optional();

// Main incoming event schema
export const incomingEventSchema = z.object({
  event: z.string(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  site: z.string().min(1, 'Site key is required'),

  // Session & User
  sessionId: z.string().optional(),
  userId: z.string().optional(),

  // Nested objects
  device: deviceInfoSchema,
  page: pageInfoSchema,
  utm: utmParamsSchema,
  server: serverInfoSchema,
  user: userInfoSchema,

  // Custom properties
  props: z.record(z.unknown()).optional(),

  // Server event marker
  _server: z.boolean().optional(),
});

export type IncomingEventInput = z.infer<typeof incomingEventSchema>; 