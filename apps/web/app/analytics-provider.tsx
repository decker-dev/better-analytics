'use client';

import { Analytics } from 'better-analytics/next';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics api="/api/collect" debug={true} />
      {children}
    </>
  );
} 