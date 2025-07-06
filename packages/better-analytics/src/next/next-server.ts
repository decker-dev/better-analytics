/**
 * Next.js Server Analytics with Auto-Initialization
 * 
 * This module extends the base server functionality with auto-initialization
 * specific to Next.js environments. Other frameworks should use the base
 * server module directly with explicit initialization.
 */

import {
  initServer,
  trackServer as baseTrackServer,
  trackPageviewServer as baseTrackPageviewServer,
  identifyServer as baseIdentifyServer,
  type ServerAnalyticsConfig,
  type ServerTrackOptions,
  type ServerEventData,
} from '../server';

// Track if we've already auto-initialized to avoid multiple calls
let hasAutoInitialized = false;

/**
 * Auto-initialize server for Next.js if not already configured
 */
function autoInitForNextJs(): void {
  if (hasAutoInitialized) return;

  // Try to get configuration from Next.js environment variables
  const site = process.env.NEXT_PUBLIC_BA_SITE || process.env.BA_SITE;
  const endpoint = process.env.NEXT_PUBLIC_BA_URL || process.env.BA_URL;
  const apiKey = process.env.BA_API_KEY;
  const debug = process.env.NODE_ENV === 'development' || process.env.BA_DEBUG === 'true';

  if (!site) {
    if (debug) {
      console.warn('Better Analytics Next.js Server: No site identifier found. Set NEXT_PUBLIC_BA_SITE or BA_SITE environment variable.');
    }
    return;
  }

  // Auto-initialize with environment variables
  const config: ServerAnalyticsConfig = {
    site,
    debug,
    ...(endpoint && { endpoint }),
    ...(apiKey && { apiKey }),
  };

  try {
    initServer(config);
    hasAutoInitialized = true;

    if (debug) {
      console.log('🚀 Better Analytics Next.js Server auto-initialized');
      console.log('📍 Endpoint:', endpoint || 'https://better-analytics.app/api/collect (default)');
      console.log('🏷️ Site:', site);
    }
  } catch (error) {
    if (debug) {
      console.error('Failed to auto-initialize Better Analytics Next.js Server:', error);
    }
  }
}

/**
 * Track event from Next.js server with auto-initialization
 */
export async function trackServer(
  eventName: string,
  props?: Record<string, unknown>,
  options?: ServerTrackOptions
): Promise<void> {
  // Auto-initialize if needed
  autoInitForNextJs();

  // Call the base trackServer function
  return baseTrackServer(eventName, props, options);
}

/**
 * Track pageview from Next.js server with auto-initialization
 */
export async function trackPageviewServer(
  path: string,
  options?: ServerTrackOptions
): Promise<void> {
  // Auto-initialize if needed
  autoInitForNextJs();

  // Call the base function
  return baseTrackPageviewServer(path, options);
}

/**
 * Identify user from Next.js server with auto-initialization
 */
export async function identifyServer(
  userId: string,
  traits?: Record<string, unknown>,
  options?: ServerTrackOptions
): Promise<void> {
  // Auto-initialize if needed
  autoInitForNextJs();

  // Call the base function
  return baseIdentifyServer(userId, traits, options);
}

// Re-export types and other functions that don't need auto-initialization
export {
  initServer,
  stitchSession,
  type ServerEventData,
  type ServerTrackOptions,
  type ServerAnalyticsConfig,
} from '../server';
