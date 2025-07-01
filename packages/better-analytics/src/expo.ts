import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import { usePathname, useSegments, useGlobalSearchParams } from 'expo-router';
import type { AnalyticsConfig, MobileEventData } from './types';

// Key for storing the event queue in AsyncStorage
const QUEUE_KEY = 'ba_event_queue';

// Export types specific to Expo
export type { MobileEventData, MobileDeviceInfo } from './types';

// Expo specific configuration interface
export interface ExpoAnalyticsConfig extends Omit<AnalyticsConfig, 'endpoint'> {
  /** API endpoint to send analytics data to */
  endpoint?: string;
  /** Enable debug mode to log events to console */
  debug?: boolean;
  /** Custom user agent override */
  userAgent?: string;
  /** Custom app version */
  appVersion?: string;
  /** Track navigation events automatically using Expo Router (default: true) */
  trackNavigation?: boolean;
}

export interface AnalyticsProviderProps extends ExpoAnalyticsConfig {
  children: React.ReactNode;
}

// Global state for Expo
let expoConfig: ExpoAnalyticsConfig | null = null;

/**
 * Initialize Expo analytics
 */
export function init(config: ExpoAnalyticsConfig): void {
  expoConfig = config;

  if (config.debug) {
    console.log('📱 Better Analytics Expo initialized');
    console.log('📍 Endpoint:', config.endpoint || 'https://better-analytics.app/api/collect');
    console.log('🏷️ Site:', config.site);
    console.log('📱 Platform:', Platform.OS);
    console.log('🧭 Auto Navigation Tracking:', config.trackNavigation !== false ? 'enabled' : 'disabled');
  }

  // Attempt to process any queued events from previous sessions on initialization
  processEventQueue();
}

/**
 * Get Expo specific device information
 */
async function getDeviceInfo(): Promise<Partial<MobileEventData>> {
  const { width, height } = Dimensions.get('window');
  const screenData = Dimensions.get('screen');

  try {
    // Expo APIs for device information
    const version = Application.nativeApplicationVersion || undefined;
    const buildNumber = Application.nativeBuildVersion || undefined;
    const bundleId = Application.applicationId || undefined;
    const deviceId = await getOrCreateDeviceId();
    const brand = Device.brand || undefined;
    const model = Device.modelName || undefined;
    const systemVersion = Platform.Version?.toString();
    const isEmulator = !Device.isDevice;
    const timezone = Localization.timezone;
    const locale = Localization.locale;

    return {
      device: {
        userAgent: expoConfig?.userAgent || `Expo/${Platform.OS}`,
        screenWidth: screenData.width,
        screenHeight: screenData.height,
        language: locale,
        timezone,
        platform: Platform.OS,
        platformVersion: systemVersion,
        brand,
        model,
        isEmulator
      },
      deviceId,
      sessionId: await getOrCreateSessionId(),
      app: {
        version: expoConfig?.appVersion || version,
        buildNumber,
        bundleId
      }
    };
  } catch (error) {
    console.warn('Better Analytics Expo: Error getting device info', error);
    return {
      device: {
        platform: Platform.OS,
        screenWidth: screenData.width,
        screenHeight: screenData.height
      }
    };
  }
}

/**
 * Get or create device ID using AsyncStorage
 */
async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem('ba_device_id');
    if (!deviceId) {
      deviceId = `expo_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await AsyncStorage.setItem('ba_device_id', deviceId);
    }
    return deviceId;
  } catch {
    return `expo_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Get or create session ID (30 min timeout)
 */
async function getOrCreateSessionId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem('ba_session');
    if (stored) {
      const { id, timestamp } = JSON.parse(stored);
      // 30 minute timeout
      if (Date.now() - timestamp < 1800000) {
        // Update timestamp
        await AsyncStorage.setItem('ba_session', JSON.stringify({
          id,
          timestamp: Date.now()
        }));
        return id;
      }
    }
  } catch {
    // Ignore errors
  }

  // Create new session
  const sessionId = `expo_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  try {
    await AsyncStorage.setItem('ba_session', JSON.stringify({
      id: sessionId,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }

  return sessionId;
}

/**
 * Track event in Expo
 */
export async function track(event: string, props?: Record<string, unknown>): Promise<void> {
  if (!expoConfig) {
    console.warn('Better Analytics Expo: Not initialized. Call init() first.');
    return;
  }

  if (!expoConfig.site) {
    console.warn('Better Analytics Expo: No site identifier provided.');
    return;
  }

  // Attempt to process any queued events first
  processEventQueue();

  // Check network connectivity
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected) {
    if (expoConfig.debug) {
      console.log('📱 Better Analytics Expo: Offline, queuing event');
    }
    // Get a partial device info to construct a default URL
    const bundleId = Application.applicationId || 'unknown';
    await queueEvent({
      event,
      timestamp: Date.now(),
      site: expoConfig.site,
      url: `app://${bundleId}`,
      referrer: '',
      ...(props && { props })
    });
    return;
  }

  const deviceInfo = await getDeviceInfo();

  const eventData: MobileEventData = {
    event,
    timestamp: Date.now(),
    url: `app://${deviceInfo.app?.bundleId || 'unknown'}`,
    referrer: '',
    site: expoConfig.site,
    ...deviceInfo,
    ...(props && { props })
  };

  // Apply beforeSend if configured
  if (expoConfig.beforeSend) {
    const beforeSendEvent = {
      type: event === 'screen_view' ? 'pageview' as const : 'event' as const,
      name: event,
      url: eventData.url,
      data: eventData
    };

    const processedEvent = await expoConfig.beforeSend(beforeSendEvent);
    if (!processedEvent || !processedEvent.data) return;

    // Send the processed event
    await sendEvent(processedEvent.data as MobileEventData);
  } else {
    await sendEvent(eventData);
  }

  if (expoConfig.debug) {
    console.log('📱 Better Analytics Expo tracked:', event, props);
  }
}

/**
 * Track screen view
 */
export async function trackScreen(screenName: string, params?: Record<string, unknown>): Promise<void> {
  await track('screen_view', {
    screen_name: screenName,
    ...params
  });
}

/**
 * Send event to analytics API
 */
async function sendEvent(data: MobileEventData): Promise<void> {
  if (!expoConfig) return;

  const endpoint = expoConfig.endpoint || 'https://better-analytics.app/api/collect';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': data.device?.userAgent || 'BetterAnalytics-Expo/0.8.0',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (expoConfig.debug) {
        console.warn('Better Analytics Expo: Failed to send event, queuing.', { status: response.status, event: data.event });
      }
      await queueEvent(data);
    }
  } catch (error) {
    if (expoConfig.debug) {
      console.warn('Better Analytics Expo: Network error, queuing event.', error);
    }
    await queueEvent(data);
  }
}

/**
 * Queue event in AsyncStorage for later
 */
async function queueEvent(data: MobileEventData): Promise<void> {
  try {
    const storedQueue = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: MobileEventData[] = storedQueue ? JSON.parse(storedQueue) : [];
    // To avoid circular data structures, we only store the essential parts of the event
    const eventToQueue: Partial<MobileEventData> = {
      event: data.event,
      timestamp: data.timestamp,
      url: data.url,
      referrer: data.referrer,
      site: data.site,
      props: data.props,
      // We don't re-queue device/app info as it will be re-fetched on send
    };
    queue.push(eventToQueue as MobileEventData);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    if (expoConfig?.debug) {
      console.warn('Better Analytics Expo: Failed to queue event.', error);
    }
  }
}

/**
 * Process and send events stored in the queue
 */
export async function processEventQueue(): Promise<void> {
  if (!expoConfig) return;

  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected) {
    if (expoConfig.debug) {
      console.log('📱 Better Analytics Expo: Offline, skipping queue processing.');
    }
    return;
  }

  try {
    const storedQueue = await AsyncStorage.getItem(QUEUE_KEY);
    if (!storedQueue) return;

    const queue: MobileEventData[] = JSON.parse(storedQueue);
    if (queue.length === 0) return;

    if (expoConfig.debug) {
      console.log(`📱 Better Analytics Expo: Processing event queue (${queue.length} events).`);
    }

    // Clear the queue first to avoid race conditions
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));

    // Get fresh device info for the batch of events
    const deviceInfo = await getDeviceInfo();

    for (const eventData of queue) {
      // Re-hydrate the event with fresh device info and send it
      await sendEvent({ ...deviceInfo, ...eventData });
    }

  } catch (error) {
    if (expoConfig.debug) {
      console.warn('Better Analytics Expo: Error processing event queue.', error);
    }
  }
}

/**
 * Hook for automatic navigation tracking with Expo Router.
 * This hook should be used inside an Expo Router app layout.
 */
export function useExpoRouterTracking() {
  // Hooks are called at the top level of the custom hook.
  const pathname = usePathname();
  const segments = useSegments();
  const searchParams = useGlobalSearchParams();
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    // Return early if not initialized or explicitly disabled.
    if (!expoConfig || expoConfig.trackNavigation === false) return;

    // Now we use the values from the hooks inside the effect.
    // We track only when the pathname actually changes.
    if (pathname && pathname !== previousRouteRef.current) {
      previousRouteRef.current = pathname;

      // Create a screen name from the pathname.
      const screenName = pathname === '/' ? 'index' : pathname.replace(/^\//, '').replace(/\//g, '_');

      trackScreen(screenName, {
        pathname,
        segments: segments.join('/'),
        params: Object.keys(searchParams).length > 0 ? searchParams : undefined
      });

      if (expoConfig.debug) {
        console.log('📱 Better Analytics Expo: Auto-tracked screen change');
        console.log('  📍 Pathname:', pathname);
        console.log('  🔀 Screen Name:', screenName);
        console.log('  📊 Segments:', segments);
        if (Object.keys(searchParams).length > 0) {
          console.log('  📌 Params:', searchParams);
        }
      }
    }
    // The effect correctly depends on the values from the router hooks.
  }, [pathname, segments, searchParams]);
}

/**
 * React Context Provider for Expo Analytics with automatic navigation tracking
 * Similar to Next.js Analytics component - just add to your app root
 */
export function AnalyticsProvider({ children, ...config }: AnalyticsProviderProps): React.ReactElement {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      init(config);
      initializedRef.current = true;
    }
  }, [config]);

  // Use the navigation tracking hook
  useExpoRouterTracking();

  return React.createElement(React.Fragment, null, children);
}

/**
 * Hook for using analytics in Expo components
 */
export function useAnalytics() {
  return {
    track,
    trackScreen,
    identify: async (userId: string, traits?: Record<string, unknown>) => {
      await track('identify', {
        user_id: userId,
        ...traits
      });
    }
  };
} 