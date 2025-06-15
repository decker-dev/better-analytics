// Better Analytics SDK - Micro-analytics JavaScript SDK
// Framework-agnostic, < 2KB gzip, tree-shakable

interface AnalyticsConfig {
  endpoint: string;
}

interface EventData {
  event: string;
  props?: Record<string, unknown>;
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
}

let config: AnalyticsConfig | null = null;

/**
 * Initialize the analytics SDK
 * @param options Configuration options
 */
export function init(options: AnalyticsConfig): void {
  config = options;

  // Immediately fire a page view when init is called
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

  const eventData: EventData = {
    event,
    props: props || {},
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    referrer: typeof window !== 'undefined' ? document.referrer : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
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