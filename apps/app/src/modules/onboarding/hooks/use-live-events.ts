import useSWR from 'swr';
import { useState, useEffect } from 'react';

interface LiveEvent {
  id: string;
  event: string;
  timestamp: number;
  url?: string;
  props?: Record<string, unknown>;
  createdAt: string;
}

interface LiveEventsResponse {
  events: LiveEvent[];
  total: number;
}

const fetcher = async (url: string): Promise<LiveEventsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

interface UseLiveEventsOptions {
  siteKey: string;
  refreshInterval?: number;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch live events for a site with real-time polling
 * Optimized for onboarding flow to show events as they arrive
 */
export function useLiveEvents({
  siteKey,
  refreshInterval = 3000, // 3 seconds during onboarding
  limit = 10,
  enabled = true,
}: UseLiveEventsOptions) {
  const { data, error, isLoading, mutate } = useSWR<LiveEventsResponse>(
    enabled ? `/api/sites/${siteKey}/events?limit=${limit}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    events: data?.events || [],
    total: data?.total || 0,
    isLoading,
    error,
    refresh: mutate,
    hasEvents: (data?.events?.length || 0) > 0,
  };
}

/**
 * Hook specifically for onboarding - starts with 2s polling
 */
export function useOnboardingEvents(siteKey: string) {
  const [shouldStopPolling, setShouldStopPolling] = useState(false);

  const { events, isLoading, error, hasEvents, refresh } = useLiveEvents({
    siteKey,
    refreshInterval: shouldStopPolling ? 0 : 2000, // Start with 2s polling
    limit: 5,
    enabled: true,
  });

  // Stop polling once we have events
  useEffect(() => {
    if (hasEvents && !shouldStopPolling) {
      // Wait a bit more to get any additional events, then stop
      setTimeout(() => setShouldStopPolling(true), 5000);
    }
  }, [hasEvents, shouldStopPolling]);

  const firstEvent = events[0];
  const recentEvents = events.slice(0, 3); // Show last 3 events

  return {
    events: recentEvents,
    firstEvent,
    hasFirstEvent: hasEvents, // Use hasEvents directly
    isLoading,
    error,
    refresh,
  };
} 