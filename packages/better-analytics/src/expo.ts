import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import type { AnalyticsConfig, MobileEventData, MobileDeviceInfo, BeforeSend } from './types';

// Re-export only mobile-relevant types for Expo users
export type { MobileEventData as EventData, MobileDeviceInfo as DeviceInfo } from './types';

// React Native specific types
export interface ReactNativeAnalyticsConfig extends Omit<AnalyticsConfig, 'endpoint'> {
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

export interface AnalyticsProviderProps extends ReactNativeAnalyticsConfig {
  children: React.ReactNode;
}

// Global state for React Native
let rnConfig: ReactNativeAnalyticsConfig | null = null;
const navigationRef: React.RefObject<unknown> | null = null;

/**
 * Initialize React Native analytics
 */
export function initRN(config: ReactNativeAnalyticsConfig): void {
  rnConfig = config;

  if (config.debug) {
    console.log('📱 Better Analytics React Native initialized');
    console.log('📍 Endpoint:', config.endpoint || 'https://better-analytics.app/api/collect');
    console.log('🏷️ Site:', config.site);
    console.log('📱 Platform:', Platform.OS);
  }
}

/**
 * Get React Native specific device information
 */
async function getRNDeviceInfo(): Promise<Partial<MobileEventData>> {
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
        userAgent: rnConfig?.userAgent || `ReactNative/${Platform.OS}`,
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
        version: rnConfig?.appVersion || version,
        buildNumber,
        bundleId
      }
    };
  } catch (error) {
    console.warn('Better Analytics RN: Error getting device info', error);
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
      deviceId = `rn_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await AsyncStorage.setItem('ba_device_id', deviceId);
    }
    return deviceId;
  } catch {
    return `rn_${Date.now()}_${Math.random().toString(36).substring(2)}`;
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
  const sessionId = `rn_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
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
 * Track event in React Native
 */
export async function trackRN(event: string, props?: Record<string, unknown>): Promise<void> {
  if (!rnConfig) {
    console.warn('Better Analytics RN: Not initialized. Call initRN() first.');
    return;
  }

  if (!rnConfig.site) {
    console.warn('Better Analytics RN: No site identifier provided.');
    return;
  }

  // Check network connectivity
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected) {
    // TODO: Queue for later when online
    if (rnConfig.debug) {
      console.log('📱 Better Analytics RN: Offline, event queued');
    }
    return;
  }

  const deviceInfo = await getRNDeviceInfo();

  const eventData: MobileEventData = {
    event,
    timestamp: Date.now(),
    url: `app://${deviceInfo.app?.bundleId || 'unknown'}`,
    referrer: '',
    site: rnConfig.site,
    ...deviceInfo,
    ...(props && { props })
  };

  // Apply beforeSend if configured
  if (rnConfig.beforeSend) {
    const beforeSendEvent = {
      type: event === 'screen_view' ? 'pageview' as const : 'event' as const,
      name: event,
      url: eventData.url,
      data: eventData
    };

    const processedEvent = await rnConfig.beforeSend(beforeSendEvent);
    if (!processedEvent || !processedEvent.data) return;

    await sendRNEvent(processedEvent.data as MobileEventData);
    return;
  }

  await sendRNEvent(eventData);
}

/**
 * Track screen view (equivalent to pageview)
 */
export async function trackScreenView(screenName: string, params?: Record<string, unknown>): Promise<void> {
  await trackRN('screen_view', {
    screen_name: screenName,
    ...params
  });
}

/**
 * Send event to analytics endpoint
 */
async function sendRNEvent(data: MobileEventData): Promise<void> {
  if (!rnConfig) return;

  if (rnConfig.debug) {
    console.log('📱 Better Analytics RN Event:', data.event);
    console.log('📦 Data:', data);
  }

  try {
    const endpoint = rnConfig.endpoint || 'https://better-analytics.app/api/collect';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': data.device?.userAgent || 'ReactNative/1.0'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok && rnConfig.debug) {
      console.error('Better Analytics RN: HTTP', response.status);
    }
  } catch (error) {
    if (rnConfig.debug) {
      console.error('Better Analytics RN: Failed to send event', error);
    }
  }
}

/**
 * Analytics Provider Component for React Native
 */
export function AnalyticsProvider({ children, ...config }: AnalyticsProviderProps): React.ReactElement {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initRN(config);
      initialized.current = true;
    }
  }, [config]);

  return React.createElement(React.Fragment, null, children);
}

/**
 * Hook for tracking in React Native components
 */
export function useAnalyticsRN() {
  return {
    track: trackRN,
    trackScreen: trackScreenView,
    identify: async (userId: string, traits?: Record<string, unknown>) => {
      try {
        await AsyncStorage.setItem('ba_user_id', userId);
      } catch {
        // Ignore storage errors
      }
      await trackRN('identify', { userId, ...traits });
    }
  };
}

// Re-export only mobile-relevant base types
export type { AnalyticsConfig, BeforeSend } from './types'; 