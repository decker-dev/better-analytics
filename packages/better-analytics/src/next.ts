'use client';

import { useEffect } from 'react';
import { init, trackPageview } from './index';
import { usePathname } from 'next/navigation';
import type { AnalyticsConfig } from './index';

export interface AnalyticsProps {
  /** API endpoint to send analytics data to */
  api?: string;
  /** Alternative name for api prop (for compatibility with init() function) */
  endpoint?: string;
  /** Site identifier to track which project/user is sending data */
  site?: string;
  /** Override environment detection (development/production) */
  mode?: 'development' | 'production' | 'auto';
  /** Enable debug mode to log events to console */
  debug?: boolean;
  /** Modify event data before sending - return null to ignore event */
  beforeSend?: (event: unknown) => unknown | null;
}

/**
 * Analytics component that automatically tracks page views in Next.js applications
 * 
 * Usage:
 *   <Analytics api="/api/collect" site="demo" />
 *   <Analytics endpoint="/api/collect" site="my-app" debug={true} />
 * 
 * Similar to Vercel Analytics - just add to your layout and it works automatically
 */
export function Analytics(props: AnalyticsProps = {}): null {
  const pathname = usePathname();
  const { api, endpoint, site, mode, debug, beforeSend } = props;

  // Auto-initialize when component mounts with provided config
  useEffect(() => {
    const analyticsEndpoint = api || endpoint;
    if (analyticsEndpoint) {
      const config: AnalyticsConfig = {
        endpoint: analyticsEndpoint,
        site: site
      };
      init(config);

      // Log debug info if enabled
      if (debug && typeof window !== 'undefined') {
        console.log('🚀 Better Analytics initialized with endpoint:', analyticsEndpoint, 'site:', site);
      }
    }
  }, [api, endpoint, site, debug]);

  // Track page changes
  useEffect(() => {
    trackPageview();

    if (debug && typeof window !== 'undefined') {
      console.log('📊 Better Analytics: Page view tracked -', pathname);
    }
  }, [pathname, debug]);

  // This component doesn't render anything
  return null;
}

// Re-export everything from the core module for convenience
export { init, track, trackPageview } from './index';
export type { AnalyticsConfig, EventData } from './index'; 