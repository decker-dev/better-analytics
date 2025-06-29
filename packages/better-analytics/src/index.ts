// Better Analytics SDK - Micro-analytics JavaScript SDK
// Framework-agnostic, < 2KB gzip, tree-shakable

interface AnalyticsConfig {
  endpoint?: string;
  site: string;
  mode?: 'auto' | 'development' | 'production';
  debug?: boolean;
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
  deviceId?: string;
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

type Mode = 'development' | 'production';

let config: AnalyticsConfig | null = null;
let currentMode: Mode = 'production';

/**
 * Detect the current environment
 */
function detectEnvironment(): Mode {
  try {
    const env = process.env.NODE_ENV;
    if (env === 'development' || env === 'test') {
      return 'development';
    }
  } catch (e) {
    // do nothing, this is okay
  }
  return 'production';
}

/**
 * Set the current mode
 */
function setMode(mode: AnalyticsConfig['mode'] = 'auto'): void {
  if (mode === 'auto') {
    currentMode = detectEnvironment();
    return;
  }
  currentMode = mode;
}

/**
 * Get the current mode
 */
function getMode(): Mode {
  return currentMode;
}

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return getMode() === 'development';
}

/**
 * Check if we're in production mode
 */
function isProduction(): boolean {
  return getMode() === 'production';
}

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
 * Simple, efficient session & device tracking
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';

  // Try to get existing session from localStorage (30 min timeout)
  try {
    const stored = localStorage.getItem('ba_s');
    if (stored) {
      const { id, t } = JSON.parse(stored);
      // Check if session is still valid (30 minutes)
      if (Date.now() - t < 1800000) {
        // Update timestamp and return existing session
        localStorage.setItem('ba_s', JSON.stringify({ id, t: Date.now() }));
        return id;
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  // Generate new session: timestamp + random
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);

  try {
    localStorage.setItem('ba_s', JSON.stringify({ id: sessionId, t: Date.now() }));
  } catch {
    // Ignore if localStorage unavailable
  }

  return sessionId;
}

/**
 * Get persistent device ID (lightweight fingerprint)
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';

  // Try localStorage first
  try {
    const stored = localStorage.getItem('ba_d');
    if (stored) return stored;
  } catch {
    // Ignore
  }

  // Generate lightweight device ID
  const deviceId = crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}-${
    // Simple fingerprint
    Math.abs([
      navigator.language || '',
      screen.width || 0,
      screen.height || 0,
      new Date().getTimezoneOffset()
    ].join('|').split('').reduce((acc, char) => {
      const hash = (acc << 5) - acc + char.charCodeAt(0);
      return hash & hash;
    }, 0)).toString(36)
    }`;

  try {
    localStorage.setItem('ba_d', deviceId);
  } catch {
    // Ignore
  }

  return deviceId;
}

/**
 * Generate a session ID that lasts approximately 30 minutes
 * @deprecated Use getSessionId() instead
 */
function generateSessionId(): string {
  // Keep for backward compatibility
  return getSessionId();
}

/**
 * Get additional browser/device information
 */
function getBrowserInfo(): {
  device?: EventData['device'];
  page?: EventData['page'];
  utm?: EventData['utm'];
  sessionId?: string;
  deviceId?: string;
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

  // Session and device IDs
  result.sessionId = getSessionId();

  return {
    ...result,
    deviceId: getDeviceId(),
  };
}

/**
 * Initialize the analytics SDK
 * @param options Configuration options
 */
export function init(options: AnalyticsConfig): void {
  config = options;
  setMode(options.mode);

  // Log initialization in development
  if (isDevelopment() && (config.debug !== false)) {
    const endpoint = config.endpoint || 'https://better-analytics.app/api/collect (default)';
    console.log('🚀 Better Analytics initialized in development mode');
    console.log('📍 Endpoint:', endpoint);
    console.log('🏷️ Site:', config.site);
    console.log('🔍 Events will be logged to console, not sent to server');
  }
}

/**
 * Initialize the analytics SDK and immediately track a pageview
 * @param options Configuration options
 */
export function initWithPageview(options: AnalyticsConfig): void {
  config = options;
  setMode(options.mode);
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

  if (!config.site) {
    console.warn('Better Analytics: No site identifier provided. Please set the site parameter.');
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
    ...(browserInfo.deviceId && { deviceId: browserInfo.deviceId }),
    ...(browserInfo.device && { device: browserInfo.device }),
    ...(browserInfo.page && { page: browserInfo.page }),
    ...(browserInfo.utm && { utm: browserInfo.utm }),

    // Add custom props if provided
    ...(props && { props }),
  };

  send(eventData);
}

/**
 * Send event data to the configured endpoint or log in development
 * @param data Event data to send
 */
async function send(data: EventData): Promise<void> {
  if (!config) return;

  // In development mode, just log to console
  if (isDevelopment()) {
    const endpoint = config.endpoint || 'https://better-analytics.app/api/collect (default)';
    console.log('📊 Better Analytics Event:', data.event);
    console.log('📍 Endpoint:', endpoint);
    console.log('📦 Data:', data);
    return;
  }

  // In production mode, send to server
  try {
    // Use default SaaS endpoint if no custom endpoint provided
    const endpoint = config.endpoint || 'https://better-analytics.app/api/collect';

    // Compress JSON and send via POST
    const payload = JSON.stringify(data);

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
  } catch (error) {
    // Silently fail in production, but log in development
    if (isDevelopment()) {
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
  currentMode = 'production';
}

// Export types for TypeScript users
export type { AnalyticsConfig, EventData }; 