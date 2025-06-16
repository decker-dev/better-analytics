'use client';

import { useEffect } from 'react';
import { init, trackPageview } from './index';
import { usePathname } from 'next/navigation';
import type { AnalyticsConfig } from './index';

export interface AnalyticsProps {
  /** API endpoint to send analytics data to (fallback if NEXT_PUBLIC_BA_URL not set) */
  api?: string;
  /** Alternative name for api prop (for compatibility with init() function) */
  endpoint?: string;
  /** Site identifier to track which project/user is sending data (fallback if NEXT_PUBLIC_BA_SITE not set) */
  site?: string;
  /** Custom environment variable name for URL (default: NEXT_PUBLIC_BA_URL) */
  urlEnvVar?: string;
  /** Custom environment variable name for site (default: NEXT_PUBLIC_BA_SITE) */
  siteEnvVar?: string;
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
 *   <Analytics />  // Uses NEXT_PUBLIC_BA_URL and NEXT_PUBLIC_BA_SITE
 *   <Analytics api="/api/collect" site="demo" />  // Props override env vars
 *   <Analytics urlEnvVar="CUSTOM_URL" siteEnvVar="CUSTOM_SITE" />  // Custom env vars
 * 
 * Similar to Vercel Analytics - just add to your layout and it works automatically
 */
export function Analytics(props: AnalyticsProps = {}): null {
  const pathname = usePathname();
  const { api, endpoint, site, urlEnvVar, siteEnvVar, mode, debug, beforeSend } = props;

  // Auto-initialize when component mounts with provided config
  useEffect(() => {
    // Get values from environment variables or props (props take precedence)
    const urlEnvName = urlEnvVar || 'NEXT_PUBLIC_BA_URL';
    const siteEnvName = siteEnvVar || 'NEXT_PUBLIC_BA_SITE';

    // Access environment variables directly (Next.js requires static references)
    const getEnvVar = (name: string) => {
      switch (name) {
        case 'NEXT_PUBLIC_BA_URL': return process.env.NEXT_PUBLIC_BA_URL;
        case 'NEXT_PUBLIC_BA_SITE': return process.env.NEXT_PUBLIC_BA_SITE;
        default: return process.env[name]; // Fallback for custom env vars
      }
    };

    const analyticsEndpoint = api || endpoint || getEnvVar(urlEnvName);
    const analyticsSite = site || getEnvVar(siteEnvName);

    if (analyticsEndpoint) {
      const config: AnalyticsConfig = {
        endpoint: analyticsEndpoint,
        site: analyticsSite
      };
      init(config);

      // Log debug info if enabled
      if (debug && typeof window !== 'undefined') {
        console.log('🚀 Better Analytics initialized with endpoint:', analyticsEndpoint, 'site:', analyticsSite);
        console.log('📦 Sources - URL:', api || endpoint ? 'prop' : `env(${urlEnvName})`, 'Site:', site ? 'prop' : `env(${siteEnvName})`);
        console.log('🔍 Debug env vars:', {
          [urlEnvName]: getEnvVar(urlEnvName),
          [siteEnvName]: getEnvVar(siteEnvName)
        });
      }
    } else if (debug && typeof window !== 'undefined') {
      console.warn('⚠️ Better Analytics: No endpoint provided. Set', urlEnvName, 'environment variable or pass api/endpoint prop.');
      console.log('🔍 Debug env vars:', {
        [urlEnvName]: getEnvVar(urlEnvName),
        [siteEnvName]: getEnvVar(siteEnvName)
      });
    }
  }, [api, endpoint, site, urlEnvVar, siteEnvVar, debug]);

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
export { init, initWithPageview, track, trackPageview } from './index';
export type { AnalyticsConfig, EventData } from './index'; 