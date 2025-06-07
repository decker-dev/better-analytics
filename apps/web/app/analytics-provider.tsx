'use client';

import { useEffect } from 'react';
import { init, useBetterAnalytics } from '@better-analytics/next';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Better Analytics with the collect endpoint
    init({ endpoint: '/api/collect' });
  }, []);

  // Use the Next.js hook to track route changes
  useBetterAnalytics();

  return <>{children}</>;
} 