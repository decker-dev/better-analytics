// Better Analytics - Server-Side Tracking
// Zero-dependency server tracking for Node.js, Edge Functions, and more

import type { BaseEventData } from './types';

// Server-specific types
interface ServerEventData extends BaseEventData {
  // Server context
  server: {
    userAgent?: string;
    ip?: string;
    country?: string;
    region?: string;
    city?: string;
    referer?: string;
    origin: string;
    runtime?: 'node' | 'edge' | 'cloudflare' | 'deno';
    framework?: string;
  };

  // User context (from auth/session)
  user?: {
    id?: string;
    email?: string;
    name?: string;
    // Session continuity with client
    sessionId?: string;
    deviceId?: string;
  };
}

interface ServerTrackOptions {
  // Headers sources
  headers?: Headers | Record<string, string | string[] | undefined>;
  request?: Request | { headers: Headers | Record<string, string | string[] | undefined> };

  // User identification
  user?: ServerEventData['user'];

  // Async execution (for edge functions)
  waitUntil?: (promise: Promise<unknown>) => void;

  // Custom metadata
  meta?: Record<string, unknown>;
}

interface ServerAnalyticsConfig {
  site: string;
  endpoint?: string;
  apiKey?: string; // For server-to-server auth
  debug?: boolean;

  // Batching configuration
  batch?: {
    size?: number; // Default: 50
    interval?: number; // Default: 5000ms
    maxRetries?: number; // Default: 3
  };

  // Runtime detection override
  runtime?: ServerEventData['server']['runtime'];
}

// Globals for server context
let serverConfig: ServerAnalyticsConfig | null = null;
let eventBatcher: EventBatcher | null = null;

/**
 * Initialize server-side analytics
 */
export function initServer(config: ServerAnalyticsConfig): void {
  serverConfig = config;

  // Initialize batcher if batch config provided
  if (config.batch) {
    eventBatcher = new EventBatcher({
      endpoint: config.endpoint || 'https://better-analytics.app/api/collect',
      apiKey: config.apiKey,
      ...config.batch,
    });
  }

  if (config.debug) {
    console.log('🚀 Better Analytics Server initialized');
    console.log('📍 Endpoint:', config.endpoint || 'https://better-analytics.app/api/collect');
    console.log('🏷️ Site:', config.site);
    console.log('⚡ Runtime:', detectRuntime());
    if (config.batch) {
      console.log('📦 Batching enabled:', config.batch);
    }
  }
}

/**
 * Track event from server
 */
export async function trackServer(
  eventName: string,
  props?: Record<string, unknown>,
  options?: ServerTrackOptions
): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'trackServer() is only for server environments. Use track() for client-side.'
    );
  }

  if (!serverConfig) {
    console.warn('Better Analytics Server: Not initialized. Call initServer() first.');
    return;
  }

  const serverInfo = extractServerInfo(options);

  const eventData: ServerEventData = {
    event: eventName,
    timestamp: Date.now(),
    site: serverConfig.site,
    url: serverInfo.origin,
    referrer: serverInfo.referer || '',
    server: serverInfo,

    // User context
    ...(options?.user && { user: options.user }),

    // Custom props
    ...(props && { props }),

    // Custom metadata
    ...(options?.meta && { meta: options.meta }),
  };

  // Use batcher if available, otherwise send directly
  if (eventBatcher) {
    eventBatcher.add(eventData);
  } else {
    const sendPromise = sendServerEvent(eventData);

    // Handle async execution for edge functions
    if (options?.waitUntil) {
      options.waitUntil(sendPromise);
    } else {
      await sendPromise;
    }
  }
}

/**
 * Track pageview from server (useful for SSR)
 */
export async function trackPageviewServer(
  path: string,
  options?: ServerTrackOptions
): Promise<void> {
  await trackServer('pageview', { path }, options);
}

/**
 * Identify user for server-side tracking
 */
export async function identifyServer(
  userId: string,
  traits?: Record<string, unknown>,
  options?: ServerTrackOptions
): Promise<void> {
  await trackServer('identify', { userId, ...traits }, {
    ...options,
    user: {
      ...options?.user,
      id: userId,
    },
  });
}

/**
 * Extract server information from headers
 */
function extractServerInfo(options?: ServerTrackOptions): ServerEventData['server'] {
  const headers = normalizeHeaders(options);

  return {
    userAgent: headers['user-agent'],
    ip: headers['x-forwarded-for'] ||
      headers['x-real-ip'] ||
      headers['cf-connecting-ip'],
    country: headers['cf-ipcountry'] ||
      headers['x-vercel-ip-country'] ||
      headers['x-country'],
    region: headers['x-vercel-ip-region'] ||
      headers['cf-region'],
    city: headers['x-vercel-ip-city'] ||
      headers['cf-city'],
    referer: headers.referer || headers.referrer,
    origin: headers.origin ||
      headers['x-forwarded-host'] ||
      headers.host ||
      'unknown',
    runtime: detectRuntime(),
    framework: detectFramework(),
  };
}

/**
 * Normalize headers to plain object
 */
function normalizeHeaders(options?: ServerTrackOptions): Record<string, string | undefined> {
  let headers: Headers | Record<string, string | string[] | undefined> | undefined;

  if (options?.headers) {
    headers = options.headers;
  } else if (options?.request) {
    headers = options.request.headers;
  }

  if (!headers) return {};

  const normalized: Record<string, string | undefined> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key.toLowerCase()] = value;
    });
  } else {
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
    }
  }

  return normalized;
}

/**
 * Detect runtime environment
 */
function detectRuntime(): ServerEventData['server']['runtime'] {
  // Override if configured
  if (serverConfig?.runtime) return serverConfig.runtime;

  // Edge runtime detection
  // @ts-ignore
  if (typeof EdgeRuntime !== 'undefined') return 'edge';
  if (process.env.NEXT_RUNTIME === 'edge') return 'edge';

  // Cloudflare Workers
  if (typeof caches !== 'undefined' && 'default' in caches) return 'cloudflare';

  // Deno
  // @ts-ignore
  if (typeof Deno !== 'undefined') return 'deno';

  // Default to Node.js
  return 'node';
}

/**
 * Detect framework
 */
function detectFramework(): string {
  if (process.env.VERCEL) return 'vercel';
  if (process.env.NEXT_RUNTIME) return 'nextjs';
  if (process.env.NUXT) return 'nuxt';
  if (process.env.GATSBY) return 'gatsby';
  if (process.env.NETLIFY) return 'netlify';

  return 'unknown';
}

/**
 * Send single event to analytics endpoint
 */
async function sendServerEvent(data: ServerEventData): Promise<void> {
  if (!serverConfig) return;

  try {
    const endpoint = serverConfig.endpoint || 'https://better-analytics.app/api/collect';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'better-analytics-server/1.0',
        'X-BA-Server': '1',
        ...(serverConfig.apiKey && { 'Authorization': `Bearer ${serverConfig.apiKey}` }),
      },
      body: JSON.stringify({
        ...data,
        _server: true, // Mark as server event
      }),
    });

    if (!response.ok && serverConfig.debug) {
      console.error(`Better Analytics Server: HTTP ${response.status}`, await response.text());
    }
  } catch (error) {
    if (serverConfig.debug) {
      console.error('Better Analytics Server: Failed to send event', error);
    }
  }
}

/**
 * Event batcher for improved performance
 */
class EventBatcher {
  private queue: ServerEventData[] = [];
  private timer?: NodeJS.Timeout | number;
  private sending = false;

  constructor(
    private config: {
      endpoint: string;
      apiKey?: string;
      size?: number;
      interval?: number;
      maxRetries?: number;
    }
  ) { }

  add(event: ServerEventData): void {
    this.queue.push(event);

    if (this.queue.length >= (this.config.size || 50)) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.config.interval || 5000);
    }
  }

  async flush(): Promise<void> {
    if (this.sending || this.queue.length === 0) return;

    this.sending = true;
    const events = this.queue.splice(0);

    if (this.timer) {
      clearTimeout(this.timer as NodeJS.Timeout);
      this.timer = undefined;
    }

    try {
      await this.sendBatch(events);
    } catch (error) {
      // Re-queue failed events
      this.queue.unshift(...events);

      if (serverConfig?.debug) {
        console.error('Better Analytics Server: Batch send failed', error);
      }
    } finally {
      this.sending = false;
    }
  }

  private async sendBatch(events: ServerEventData[]): Promise<void> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'better-analytics-server/1.0',
        'X-BA-Server': '1',
        'X-BA-Batch': '1',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        events,
        _batch: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

// Session stitching helper
export function stitchSession(
  clientSessionId?: string,
  clientDeviceId?: string
): ServerEventData['user'] {
  return {
    sessionId: clientSessionId,
    deviceId: clientDeviceId,
  };
}

// Express.js middleware
interface ExpressRequest extends Record<string, unknown> {
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  user?: { id?: string };
  track?: (event: string, props?: Record<string, unknown>) => Promise<void>;
}

export function expressMiddleware() {
  return (req: ExpressRequest, res: unknown, next: () => void) => {
    // Add tracking helper to request
    req.track = (event: string, props?: Record<string, unknown>) => {
      return trackServer(event, props, {
        headers: req.headers,
        user: {
          sessionId: req.cookies?.ba_session,
          deviceId: req.cookies?.ba_device,
          id: req.user?.id,
        },
      });
    };

    next();
  };
}

// Export everything
export type { ServerEventData, ServerTrackOptions, ServerAnalyticsConfig }; 