// Better Analytics SDK - Micro-analytics JavaScript SDK
// Framework-agnostic, < 2KB gzip, tree-shakable

interface AnalyticsConfig {
  endpoint: string;
  site?: string;
}

interface EventData {
  // Core event data
  event: string;
  timestamp: number;
  site?: string;

  // Page context
  url: string;
  referrer: string;

  // Session & User
  sessionId?: string;
  userId?: string;

  // Device & Browser (only send if available)
  device?: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    language?: string;
    timezone?: string;
    connectionType?: string;
  };

  // Page info (only send if available)
  page?: {
    title?: string;
    pathname?: string;
    hostname?: string;
    loadTime?: number;
  };

  // UTM parameters (only send if present)
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Custom properties from user
  props?: Record<string, unknown>;
}

interface NetworkConnection {
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

let config: AnalyticsConfig | null = null;

/**
 * Extract UTM parameters from a URL
 */
function extractUtmParams(url: string): Record<string, string | null> {
  try {
    const urlObj = new URL(url);
    return {
      utmSource: urlObj.searchParams.get('utm_source'),
      utmMedium: urlObj.searchParams.get('utm_medium'),
      utmCampaign: urlObj.searchParams.get('utm_campaign'),
      utmTerm: urlObj.searchParams.get('utm_term'),
      utmContent: urlObj.searchParams.get('utm_content'),
    };
  } catch {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };
  }
}

/**
 * Generate a session ID that lasts approximately 30 minutes
 */
function generateSessionId(): string {
  if (typeof window === 'undefined') return '';

  // Create a session ID that lasts approximately 30 minutes
  const sessionWindow = 30 * 60 * 1000; // 30 minutes in ms
  const now = Date.now();
  const sessionTimestamp = Math.floor(now / sessionWindow) * sessionWindow;

  // Use a combination of user agent and timestamp for uniqueness
  const userAgent = navigator.userAgent || '';
  const hash = userAgent.split('').reduce((acc, char) => {
    const newAcc = ((acc << 5) - acc) + char.charCodeAt(0);
    return newAcc & newAcc;
  }, 0);

  return `${sessionTimestamp}-${Math.abs(hash)}`;
}

/**
 * Get additional browser/device information
 */
function getBrowserInfo(): {
  device?: EventData['device'];
  page?: EventData['page'];
  utm?: EventData['utm'];
  sessionId?: string;
} {
  if (typeof window === 'undefined') return {};

  const result: {
    device?: EventData['device'];
    page?: EventData['page'];
    utm?: EventData['utm'];
    sessionId?: string;
  } = {};

  // Device information
  const device: NonNullable<EventData['device']> = {};

  if (navigator.userAgent) {
    device.userAgent = navigator.userAgent;
  }

  if (screen.width && screen.height) {
    device.screenWidth = screen.width;
    device.screenHeight = screen.height;
  }

  if (window.innerWidth && window.innerHeight) {
    device.viewportWidth = window.innerWidth;
    device.viewportHeight = window.innerHeight;
  }

  if (navigator.language) {
    device.language = navigator.language;
  }

  try {
    device.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Ignore if not available
  }

  if ('connection' in navigator) {
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      device.connectionType = connection.effectiveType;
    }
  }

  // Only add device if it has properties
  if (Object.keys(device).length > 0) {
    result.device = device;
  }

  // Page information
  const page: NonNullable<EventData['page']> = {};

  if (document.title) {
    page.title = document.title;
  }

  if (window.location) {
    page.pathname = window.location.pathname;
    page.hostname = window.location.hostname;
  }

  if (window.performance?.timing) {
    const timing = window.performance.timing;
    if (timing.loadEventEnd && timing.navigationStart) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      if (loadTime > 0) {
        page.loadTime = loadTime;
      }
    }
  }

  // Only add page if it has properties
  if (Object.keys(page).length > 0) {
    result.page = page;
  }

  // UTM parameters
  if (window.location?.href) {
    const utmParams = extractUtmParams(window.location.href);
    const utm: NonNullable<EventData['utm']> = {};

    if (utmParams.utmSource) utm.source = utmParams.utmSource;
    if (utmParams.utmMedium) utm.medium = utmParams.utmMedium;
    if (utmParams.utmCampaign) utm.campaign = utmParams.utmCampaign;
    if (utmParams.utmTerm) utm.term = utmParams.utmTerm;
    if (utmParams.utmContent) utm.content = utmParams.utmContent;

    // Only add utm if it has properties
    if (Object.keys(utm).length > 0) {
      result.utm = utm;
    }
  }

  // Session ID
  result.sessionId = generateSessionId();

  return result;
}

/**
 * Initialize the analytics SDK
 * @param options Configuration options
 */
export function init(options: AnalyticsConfig): void {
  config = options;
}

/**
 * Initialize the analytics SDK and immediately track a pageview
 * @param options Configuration options
 */
export function initWithPageview(options: AnalyticsConfig): void {
  config = options;
  trackPageview();
}

/**
 * Track a page view event
 */
export function trackPageview(): void {
  track('pageview');
}

/**
 * Track a custom event with optional properties
 * @param event Event name
 * @param props Optional event properties
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (!config) {
    console.warn('Better Analytics: SDK not initialized. Call init() first.');
    return;
  }

  // Get browser info with optimized structure
  const browserInfo = getBrowserInfo();

  const eventData: EventData = {
    event,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof window !== 'undefined' ? document.referrer : '',
    site: config.site,

    // Add browser info if available
    ...(browserInfo.sessionId && { sessionId: browserInfo.sessionId }),
    ...(browserInfo.device && { device: browserInfo.device }),
    ...(browserInfo.page && { page: browserInfo.page }),
    ...(browserInfo.utm && { utm: browserInfo.utm }),

    // Add custom props if provided
    ...(props && { props }),
  };

  send(eventData);
}

/**
 * Send event data to the configured endpoint
 * @param data Event data to send
 */
async function send(data: EventData): Promise<void> {
  if (!config) return;

  try {
    // Compress JSON and send via POST
    const payload = JSON.stringify(data);

    await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Better Analytics: Failed to send event', error);
    }
  }
}

/**
 * Reset the SDK configuration (for testing purposes)
 * @internal
 */
export function _resetConfig(): void {
  config = null;
}

// Export types for TypeScript users
export type { AnalyticsConfig, EventData }; 