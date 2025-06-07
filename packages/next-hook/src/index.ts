import { useEffect } from 'react';
import { trackPageview } from '@better/analytics';
import { usePathname } from 'next/navigation';

/**
 * React hook that automatically tracks page views in Next.js applications
 * Wires Next.js navigation changes to the Better Analytics trackPageview function
 */
export function useBetterAnalytics(): void {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    trackPageview();
  }, [pathname]);
}

// Re-export the main SDK functions for convenience
export { init, track, trackPageview } from '@better/analytics';
export type { AnalyticsConfig, EventData } from '@better/analytics'; 