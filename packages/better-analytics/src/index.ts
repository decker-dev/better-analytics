// Better Analytics SDK - Micro-analytics JavaScript SDK
// Framework-agnostic, < 2KB gzip, tree-shakable

interface AnalyticsConfig {
  endpoint: string;
  site?: string;
}

interface EventData {
  event: string;
  props?: Record<string, unknown>;
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  site?: string;
}

interface NetworkConnection {
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

let config: AnalyticsConfig | null = null;

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
function getBrowserInfo(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};

  const info: Record<string, unknown> = {};

  // Screen resolution
  if (screen.width && screen.height) {
    info.screenWidth = screen.width;
    info.screenHeight = screen.height;
  }

  // Viewport size
  if (window.innerWidth && window.innerHeight) {
    info.viewportWidth = window.innerWidth;
    info.viewportHeight = window.innerHeight;
  }

  // Language
  if (navigator.language) {
    info.language = navigator.language;
  }

  // Page title
  if (document.title) {
    info.pageTitle = document.title;
  }

  // URL information
  if (window.location) {
    info.pathname = window.location.pathname;
    info.hostname = window.location.hostname;
  }

  // Performance timing (if available)
  if (window.performance?.timing) {
    const timing = window.performance.timing;
    if (timing.loadEventEnd && timing.navigationStart) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      if (loadTime > 0) {
        info.loadTime = loadTime;
      }
    }
  }

  // Connection information (if available)
  if ('connection' in navigator) {
    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      info.connectionType = connection.effectiveType;
    }
  }

  // Timezone
  try {
    info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Ignore if not available
  }

  // Session ID
  info.sessionId = generateSessionId();

  return info;
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

  // Merge browser info with custom props
  const browserInfo = getBrowserInfo();
  const mergedProps = { ...browserInfo, ...props };

  const eventData: EventData = {
    event,
    props: mergedProps,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof window !== 'undefined' ? document.referrer : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    site: config.site,
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