import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import type { AnalyticsConfig, MobileEventData, MobileDeviceInfo, BeforeSend } from './types';

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

  // Check network connectivity
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected) {
    // TODO: Queue for later when online
    if (expoConfig.debug) {
      console.log('📱 Better Analytics Expo: Offline, event queued');
    }
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

    if (!response.ok && expoConfig.debug) {
      console.warn('Better Analytics Expo: Failed to send event', response.status);
    }
  } catch (error) {
    if (expoConfig.debug) {
      console.warn('Better Analytics Expo: Network error', error);
    }
    // TODO: Queue for retry
  }
}

/**
 * Hook for automatic navigation tracking with Expo Router
 * This hook should be used inside NavigationContainer or Expo Router app
 */
export function useExpoRouterTracking() {
  const previousRouteRef = useRef<string | null>(null);

  useEffect(() => {
    // Return early if not initialized or explicitly disabled
    if (!expoConfig || expoConfig.trackNavigation === false) return;

    // Try to import Expo Router hooks dynamically
    let usePathname: () => string;
    let useSegments: () => string[];
    let useGlobalSearchParams: () => Record<string, string | string[]>;

    try {
      // Dynamic import for Expo Router
      const expoRouter = require('expo-router');
      usePathname = expoRouter.usePathname;
      useSegments = expoRouter.useSegments;
      useGlobalSearchParams = expoRouter.useGlobalSearchParams;
    } catch (error) {
      if (expoConfig.debug) {
        console.warn('Better Analytics Expo: expo-router not found. Install expo-router for automatic tracking.');
      }
      return;
    }

    // Get current route information
    let pathname: string;
    let segments: string[];
    let searchParams: Record<string, string | string[]>;

    try {
      pathname = usePathname();
      segments = useSegments();
      searchParams = useGlobalSearchParams();
    } catch (error) {
      if (expoConfig.debug) {
        console.warn('Better Analytics Expo: Error getting route info. Make sure this hook is used inside Expo Router app.');
      }
      return;
    }

    // Track route changes
    if (pathname && pathname !== previousRouteRef.current) {
      previousRouteRef.current = pathname;

      // Create screen name from pathname
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
  });
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