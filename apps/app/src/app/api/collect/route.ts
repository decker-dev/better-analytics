import { type NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/modules/shared/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import UAParser from 'my-ua-parser';

// Schema para validar los datos de entrada del SDK
const incomingEventSchema = z.object({
  event: z.string(),
  timestamp: z.number(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  site: z.string().optional(),

  // Session & User
  sessionId: z.string().optional(),
  userId: z.string().optional(),

  // Device info (optional object)
  device: z.object({
    userAgent: z.string().optional(),
    screenWidth: z.number().optional(),
    screenHeight: z.number().optional(),
    viewportWidth: z.number().optional(),
    viewportHeight: z.number().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    connectionType: z.string().optional(),
  }).optional(),

  // Page info (optional object)
  page: z.object({
    title: z.string().optional(),
    pathname: z.string().optional(),
    hostname: z.string().optional(),
    loadTime: z.number().optional(),
  }).optional(),

  // UTM parameters (optional object)
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),

  // Server info (for server-side events)
  server: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    referer: z.string().optional(),
    origin: z.string().optional(),
    runtime: z.string().optional(),
    framework: z.string().optional(),
  }).optional(),

  // User info (for server-side events)
  user: z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    sessionId: z.string().optional(),
    deviceId: z.string().optional(),
  }).optional(),

  // Custom properties
  props: z.record(z.unknown()).optional(),

  // Server event marker
  _server: z.boolean().optional(),
});

// Interface for geolocation data
interface GeolocationData {
  country: string | null;
  region: string | null;
  city: string | null;
}

/**
 * Extract the real client IP from request headers
 * Handles various proxy and CDN configurations
 */
function extractClientIP(request: NextRequest): string | null {
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
 * Basic IP validation to ensure we have a valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  // Remove any whitespace
  const trimmedIP = ip.trim();

  // Skip local/private IPs that won't work with geolocation services
  if (trimmedIP === '127.0.0.1' || trimmedIP === '::1' || trimmedIP.startsWith('192.168.') || trimmedIP.startsWith('10.') || trimmedIP.startsWith('172.')) {
    return false;
  }

  // Basic IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(trimmedIP)) {
    return true;
  }

  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv6Regex.test(trimmedIP)) {
    return true;
  }

  return false;
}

/**
 * Get geolocation data from ip-api.com
 * Includes proper error handling and timeout
 */
async function getGeolocation(ip: string): Promise<GeolocationData> {
  const defaultResult: GeolocationData = {
    country: null,
    region: null,
    city: null,
  };

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Better-Analytics/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Geolocation API returned ${response.status} for IP ${ip}`);
      return defaultResult;
    }

    const data = await response.json();

    // Check if the API returned success status
    if (data.status !== 'success') {
      console.warn(`Geolocation failed for IP ${ip}:`, data.status);
      return defaultResult;
    }

    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
    };
  } catch (error) {
    // Handle timeout, network errors, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`Geolocation timeout for IP ${ip}`);
      } else {
        console.warn(`Geolocation error for IP ${ip}:`, error.message);
      }
    }
    return defaultResult;
  }
}

// Handle CORS preflight request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validar los datos de entrada
    const validatedData = incomingEventSchema.parse(body);

    // Extraer información de props (que viene del SDK)
    const props = validatedData.props || {};

    // El SDK ya nos envía toda la información que necesitamos
    const siteKey = validatedData.site || props.hostname as string || 'unknown';

    // Verificar si el site existe y obtener configuración de protección
    const [siteConfig] = await db
      .select({
        siteKey: schema.sites.siteKey,
        domainProtection: schema.sites.domainProtection,
        allowedDomains: schema.sites.allowedDomains,
      })
      .from(schema.sites)
      .where(eq(schema.sites.siteKey, siteKey))
      .limit(1);

    if (!siteConfig) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        {
          status: 404, headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validar dominio si la protección está activada
    if (siteConfig.domainProtection && siteConfig.allowedDomains) {
      const allowedDomains = siteConfig.allowedDomains;
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');

      const isAllowed = allowedDomains.some((domain: string) => {
        const cleanDomain = domain.toLowerCase().trim();
        const originMatch = origin?.toLowerCase().includes(cleanDomain);
        const refererMatch = referer?.toLowerCase().includes(cleanDomain);
        return originMatch || refererMatch;
      });

      if (!isAllowed) {
        return NextResponse.json(
          { success: false, error: 'Domain not allowed' },
          {
            status: 403, headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }
    }

    // Extract client IP and get geolocation
    // For server-side events, IP might come in the data, otherwise extract from headers
    let clientIP: string | null = null;

    // Check if this is a server-side event with IP already provided
    if (validatedData.server?.ip) {
      clientIP = validatedData.server.ip;
    }

    // If no IP from server data, extract from request headers (client-side events)
    if (!clientIP) {
      console.log('no ip', request);
      clientIP = extractClientIP(request);
    }

    let geolocationData: GeolocationData = {
      country: null,
      region: null,
      city: null,
    };

    // Only attempt geolocation if we have a valid IP
    if (clientIP) {
      try {
        geolocationData = await getGeolocation(clientIP);
      } catch (error) {
        // Geolocation failed, but we continue with null values
        console.warn('Geolocation failed, continuing without geo data:', error);
      }
    }

    // Parsear el user agent solo para información básica
    const userAgentInfo = validatedData.device?.userAgent ? UAParser(validatedData.device.userAgent) : null;

    // Session ID viene del SDK
    const sessionId = validatedData.sessionId || props.sessionId as string || null;

    // Preparar los datos para insertar - usar principalmente datos del SDK
    const eventToInsert = {
      id: nanoid(),
      site: siteKey,
      ts: validatedData.timestamp.toString(),
      evt: validatedData.event,
      url: validatedData.url || null,
      ref: validatedData.referrer || null,
      props: validatedData.props ? JSON.stringify(validatedData.props) : null,

      // User Agent information (básica)
      userAgent: validatedData.device?.userAgent || null,
      browser: userAgentInfo?.browser.name ?
        `${userAgentInfo.browser.name} ${userAgentInfo.browser.version || ''}`.trim() : null,
      os: userAgentInfo?.os.name ?
        `${userAgentInfo.os.name} ${userAgentInfo.os.version || ''}`.trim() : null,
      device: userAgentInfo?.device.type || null,
      deviceVendor: userAgentInfo?.device.vendor || null,
      deviceModel: userAgentInfo?.device.model || null,
      engine: userAgentInfo?.engine.name || null,
      cpu: userAgentInfo?.cpu.architecture || null,

      // Geographic information (from IP geolocation)
      country: geolocationData.country,
      region: geolocationData.region,
      city: geolocationData.city,

      // Session information
      sessionId: sessionId,
      userId: validatedData.userId || null,

      // Page information (del SDK)
      pageTitle: validatedData.page?.title || null,
      pathname: validatedData.page?.pathname || null,
      hostname: validatedData.page?.hostname || null,

      // Performance metrics (del SDK)
      loadTime: validatedData.page?.loadTime || null,

      // UTM parameters (ahora vienen del SDK)
      utmSource: validatedData.utm?.source || null,
      utmMedium: validatedData.utm?.medium || null,
      utmCampaign: validatedData.utm?.campaign || null,
      utmTerm: validatedData.utm?.term || null,
      utmContent: validatedData.utm?.content || null,

      // Screen and viewport information (del SDK)
      screenWidth: validatedData.device?.screenWidth || null,
      screenHeight: validatedData.device?.screenHeight || null,
      viewportWidth: validatedData.device?.viewportWidth || null,
      viewportHeight: validatedData.device?.viewportHeight || null,

      // Language (del SDK)
      language: validatedData.device?.language || null,
    };
    console.log(eventToInsert);
    // Insert into database
    await db.insert(schema.events).values(eventToInsert);

    return NextResponse.json({ success: true, type: 'permanent' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error saving event:', error);

    // Si es un error de validación de Zod, devolver detalles específicos
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}