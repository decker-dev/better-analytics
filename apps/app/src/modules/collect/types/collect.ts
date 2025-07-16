export interface GeolocationData {
  country: string | null;
  region: string | null;
  city: string | null;
}

export interface DeviceInfo {
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  timezone?: string;
  connectionType?: string;
}

export interface PageInfo {
  title?: string;
  pathname?: string;
  hostname?: string;
  loadTime?: number;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface ServerInfo {
  userAgent?: string;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  referer?: string;
  origin?: string;
  runtime?: string;
  framework?: string;
}

export interface UserInfo {
  id?: string;
  email?: string;
  name?: string;
  sessionId?: string;
  deviceId?: string;
}

export interface IncomingEvent {
  event: string;
  timestamp: number;
  url?: string;
  referrer?: string;
  site: string;
  sessionId?: string;
  userId?: string;
  device?: DeviceInfo;
  page?: PageInfo;
  utm?: UtmParams;
  server?: ServerInfo;
  user?: UserInfo;
  props?: Record<string, unknown>;
  _server?: boolean;
}

export interface ParsedUserAgent {
  browser: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { type?: string; vendor?: string; model?: string };
  engine: { name?: string };
  cpu: { architecture?: string };
}

export interface ProcessedEvent {
  id: string;
  site: string;
  ts: string;
  evt: string;
  url: string | null;
  ref: string | null;
  props: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  engine: string | null;
  cpu: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  sessionId: string | null;
  userId: string | null;
  pageTitle: string | null;
  pathname: string | null;
  hostname: string | null;
  loadTime: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  language: string | null;
}

export interface SiteConfig {
  siteKey: string;
  domainProtection: boolean | null;
  allowedDomains: string[] | null;
} 