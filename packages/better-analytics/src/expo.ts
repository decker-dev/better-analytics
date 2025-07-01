import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import type { AnalyticsConfig, MobileEventData, MobileDeviceInfo, BeforeSend } from './types';

// Re-export only Expo-relevant types for Expo users
export type { MobileEventData as EventData, MobileDeviceInfo as DeviceInfo } from './types';

// Expo specific types
export interface ExpoAnalyticsConfig extends Omit<AnalyticsConfig, 'endpoint'> {
  /** API endpoint to send analytics data to */
  endpoint?: string;
  /** Enable debug mode to log events to console */
  debug?: boolean;
  /** Custom user agent override */
  userAgent?: string;
  /** Custom app version */
  appVersion?: string;
  /** Track navigation events automatically */
  trackNavigation?: boolean;
}

export interface AnalyticsProviderProps extends ExpoAnalyticsConfig {
  children: React.ReactNode;
}

// Global state for Expo
let expoConfig: ExpoAnalyticsConfig | null = null;
const navigationRef: React.RefObject<unknown> | null = null;

/**
 * Initialize Expo analytics
 */
export function initExpo(config: ExpoAnalyticsConfig): void {
  expoConfig = config;

  if (config.debug) {
    console.log('📱 Better Analytics Expo initialized');
    console.log('📍 Endpoint:', config.endpoint || 'https://better-analytics.app/api/collect');
    console.log('🏷️ Site:', config.site);
    console.log('📱 Platform:', Platform.OS);
  }
}

/**
 * Get Expo specific device information
 */
async function getExpoDeviceInfo(): Promise<Partial<MobileEventData>> {
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
    console.warn('Better Analytics Expo: Not initialized. Call initExpo() first.');
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

  const deviceInfo = await getExpoDeviceInfo();

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
    await sendExpoEvent(processedEvent.data as MobileEventData);
  } else {
    await sendExpoEvent(eventData);
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
async function sendExpoEvent(data: MobileEventData): Promise<void> {
  if (!expoConfig) return;

  const endpoint = expoConfig.endpoint || 'https://better-analytics.app/api/collect';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': data.device?.userAgent || 'BetterAnalytics-Expo/0.7.0',
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
 * React Context Provider for Expo Analytics
 */
export function AnalyticsProvider({ children, ...config }: AnalyticsProviderProps): React.ReactElement {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initExpo(config);
      initializedRef.current = true;
    }
  }, [config]);

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

// Aliases for backward compatibility and convenience
export const trackRN = track;
export const trackScreenView = trackScreen;
export const initRN = initExpo;
export const useAnalyticsRN = useAnalytics; 