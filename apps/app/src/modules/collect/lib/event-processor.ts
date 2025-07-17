import type { NextRequest } from 'next/server';
import { db, schema } from '@/modules/shared/lib/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { NewWebEvent, NewMobileEvent, NewServerEvent, NewGeoEvent } from '@/modules/shared/lib/db/schema';
import { getGeolocation, isValidIP } from './geolocation';
import {
  parseUserAgent,
  formatBrowser,
  formatOS,
  getDeviceType,
  getDeviceVendor,
  getDeviceModel,
  getEngine,
  getCPU
} from './user-agent';
import type {
  IncomingEvent,
  ProcessedEvent,
  SiteConfig,
  GeolocationData
} from '../types/collect';

/**
 * Extract the real client IP from request headers
 * Handles various proxy and CDN configurations
 */
export function extractClientIP(request: NextRequest): string | null {
  // Check various headers in priority order
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one (original client)
    const firstIP = xForwardedFor.split(',')[0]?.trim();
    if (firstIP && isValidIP(firstIP)) {
      return firstIP;
    }
  }

  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP && isValidIP(xRealIP)) {
    return xRealIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    return cfConnectingIP;
  }

  const xVercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (xVercelForwardedFor && isValidIP(xVercelForwardedFor)) {
    return xVercelForwardedFor;
  }

  return null;
}



/**
 * Get site configuration from database
 */
export async function getSiteConfig(siteKey: string): Promise<SiteConfig | null> {
  try {
    const [siteConfig] = await db
      .select({
        siteKey: schema.sites.siteKey,
        domainProtection: schema.sites.domainProtection,
        allowedDomains: schema.sites.allowedDomains,
      })
      .from(schema.sites)
      .where(eq(schema.sites.siteKey, siteKey))
      .limit(1);

    return siteConfig || null;
  } catch (error) {
    console.error('Failed to get site config:', error);
    return null;
  }
}

/**
 * Validate domain protection if enabled
 */
export function validateDomainProtection(
  siteConfig: SiteConfig,
  request: NextRequest
): boolean {
  if (!siteConfig.domainProtection || !siteConfig.allowedDomains) {
    return true; // No protection enabled
  }

  const allowedDomains = siteConfig.allowedDomains;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  return allowedDomains.some((domain: string) => {
    const cleanDomain = domain.toLowerCase().trim();
    const originMatch = origin?.toLowerCase().includes(cleanDomain);
    const refererMatch = referer?.toLowerCase().includes(cleanDomain);
    return originMatch || refererMatch;
  });
}

/**
 * Extract and resolve client IP for geolocation
 */
export async function resolveClientIP(
  incomingEvent: IncomingEvent,
  request: NextRequest
): Promise<string | null> {
  // For server-side events, IP might come in the data
  if (incomingEvent.server?.ip) {
    return incomingEvent.server.ip;
  }

  // For client-side events, extract from request headers
  return extractClientIP(request);
}

/**
 * Process incoming event and convert to database format
 */
export async function processEvent(
  incomingEvent: IncomingEvent,
  request: NextRequest
): Promise<ProcessedEvent> {
  // Site key is now required from validation
  const siteKey = incomingEvent.site;

  // Get client IP and geolocation
  const clientIP = await resolveClientIP(incomingEvent, request);

  let geolocationData: GeolocationData = {
    country: null,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
  };

  if (clientIP) {
    try {
      geolocationData = await getGeolocation(clientIP);
    } catch (error) {
      console.warn('Geolocation failed, continuing without geo data:', error);
    }
  }

  // Parse user agent information
  const userAgentString = incomingEvent.device?.userAgent || null;
  const parsedUserAgent = userAgentString ? parseUserAgent(userAgentString) : null;

  // Extract session and device IDs from event or props
  const props = incomingEvent.props || {};
  const sessionId = incomingEvent.sessionId || (props.sessionId as string) || null;
  const deviceId = incomingEvent.deviceId || (props.deviceId as string) || null;

  // Build the processed event
  const processedEvent: ProcessedEvent = {
    id: nanoid(),
    site: siteKey,
    ts: incomingEvent.timestamp.toString(),
    evt: incomingEvent.event,
    url: incomingEvent.url || null,
    ref: incomingEvent.referrer || null,
    props: incomingEvent.props ? JSON.stringify(incomingEvent.props) : null,

    // User Agent information
    userAgent: userAgentString,
    browser: formatBrowser(parsedUserAgent),
    os: formatOS(parsedUserAgent),
    device: getDeviceType(parsedUserAgent),
    deviceVendor: getDeviceVendor(parsedUserAgent),
    deviceModel: getDeviceModel(parsedUserAgent),
    engine: getEngine(parsedUserAgent),
    cpu: getCPU(parsedUserAgent),

    // Geographic information
    country: geolocationData.country,
    region: geolocationData.region,
    city: geolocationData.city,
    latitude: geolocationData.latitude,
    longitude: geolocationData.longitude,

    // Session information
    sessionId: sessionId,
    deviceId: deviceId,
    userId: incomingEvent.userId || null,

    // Page information
    pageTitle: incomingEvent.page?.title || null,
    pathname: incomingEvent.page?.pathname || null,
    hostname: incomingEvent.page?.hostname || null,

    // Performance metrics
    loadTime: incomingEvent.page?.loadTime || null,

    // UTM parameters
    utmSource: incomingEvent.utm?.source || null,
    utmMedium: incomingEvent.utm?.medium || null,
    utmCampaign: incomingEvent.utm?.campaign || null,
    utmTerm: incomingEvent.utm?.term || null,
    utmContent: incomingEvent.utm?.content || null,

    // Screen and viewport information
    screenWidth: incomingEvent.device?.screenWidth || null,
    screenHeight: incomingEvent.device?.screenHeight || null,
    viewportWidth: incomingEvent.device?.viewportWidth || null,
    viewportHeight: incomingEvent.device?.viewportHeight || null,

    // Language and timezone
    language: incomingEvent.device?.language || null,
    timezone: incomingEvent.device?.timezone || null,

    // Connection type
    connectionType: incomingEvent.device?.connectionType || null,

    // Mobile-specific fields
    platform: incomingEvent.device?.platform || null,
    platformVersion: incomingEvent.device?.platformVersion || null,
    brand: incomingEvent.device?.brand || null,
    model: incomingEvent.device?.model || null,
    isEmulator: incomingEvent.device?.isEmulator || null,

    // App-specific fields (mobile apps)
    appVersion: incomingEvent.app?.version || null,
    appBuildNumber: incomingEvent.app?.buildNumber || null,
    bundleId: incomingEvent.app?.bundleId || null,

    // Server-specific fields
    serverRuntime: incomingEvent.server?.runtime || null,
    serverFramework: incomingEvent.server?.framework || null,
    serverIP: incomingEvent.server?.ip || null,
    serverOrigin: incomingEvent.server?.origin || null,
  };

  return processedEvent;
}

/**
 * Save processed event to normalized database tables
 */
export async function saveEvent(processedEvent: ProcessedEvent): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Insert base event
      const baseEvent = {
        id: processedEvent.id,
        site: processedEvent.site,
        timestamp: new Date(Number(processedEvent.ts)),
        event: processedEvent.evt,
        url: processedEvent.url,
        referrer: processedEvent.ref,
        sessionId: processedEvent.sessionId,
        deviceId: processedEvent.deviceId,
        userId: processedEvent.userId,
        props: processedEvent.props ? JSON.parse(processedEvent.props) : null,
      };

      await tx.insert(schema.events).values(baseEvent);

      // 2. Insert geographic data if available
      if (processedEvent.country || processedEvent.region || processedEvent.city) {
        const geoData: NewGeoEvent = {
          eventId: processedEvent.id,
          country: processedEvent.country,
          region: processedEvent.region,
          city: processedEvent.city,
          latitude: processedEvent.latitude,
          longitude: processedEvent.longitude,
        };
        await tx.insert(schema.geoEvents).values(geoData);
      }

      // 3. Determine event type and insert specific data
      const isMobile = processedEvent.platform || processedEvent.appVersion || processedEvent.bundleId;
      const isServer = processedEvent.serverRuntime || processedEvent.serverFramework;

      if (isMobile) {
        // Mobile event
        const mobileData: NewMobileEvent = {
          eventId: processedEvent.id,
          platform: processedEvent.platform,
          platformVersion: processedEvent.platformVersion,
          brand: processedEvent.brand,
          model: processedEvent.model,
          isEmulator: processedEvent.isEmulator,
          appVersion: processedEvent.appVersion,
          appBuildNumber: processedEvent.appBuildNumber,
          bundleId: processedEvent.bundleId,
          language: processedEvent.language,
          timezone: processedEvent.timezone,
          screenWidth: processedEvent.screenWidth,
          screenHeight: processedEvent.screenHeight,
        };
        await tx.insert(schema.mobileEvents).values(mobileData);
      } else if (isServer) {
        // Server event
        const serverData: NewServerEvent = {
          eventId: processedEvent.id,
          runtime: processedEvent.serverRuntime,
          framework: processedEvent.serverFramework,
          serverIP: processedEvent.serverIP,
          origin: processedEvent.serverOrigin,
          userAgent: processedEvent.userAgent,
        };
        await tx.insert(schema.serverEvents).values(serverData);
      } else {
        // Web event (default)
        const webData: NewWebEvent = {
          eventId: processedEvent.id,
          userAgent: processedEvent.userAgent,
          browser: processedEvent.browser,
          os: processedEvent.os,
          device: processedEvent.device,
          deviceVendor: processedEvent.deviceVendor,
          deviceModel: processedEvent.deviceModel,
          engine: processedEvent.engine,
          cpu: processedEvent.cpu,
          pageTitle: processedEvent.pageTitle,
          pathname: processedEvent.pathname,
          hostname: processedEvent.hostname,
          loadTime: processedEvent.loadTime,
          utmSource: processedEvent.utmSource,
          utmMedium: processedEvent.utmMedium,
          utmCampaign: processedEvent.utmCampaign,
          utmTerm: processedEvent.utmTerm,
          utmContent: processedEvent.utmContent,
          screenWidth: processedEvent.screenWidth,
          screenHeight: processedEvent.screenHeight,
          viewportWidth: processedEvent.viewportWidth,
          viewportHeight: processedEvent.viewportHeight,
          language: processedEvent.language,
          timezone: processedEvent.timezone,
          connectionType: processedEvent.connectionType,
        };
        await tx.insert(schema.webEvents).values(webData);
      }
    });
  } catch (error) {
    console.error('Failed to save event to database:', error);
    throw error;
  }
} 