// Better Analytics - Shared Types

/**
 * Core Analytics Configuration
 */
export interface AnalyticsConfig {
  /** Analytics endpoint (defaults to Better Analytics SaaS) */
  endpoint?: string;
  /** Site identifier (required) */
  site: string;
  /** Environment mode */
  mode?: 'auto' | 'development' | 'production';
  /** Enable debug logging */
  debug?: boolean;
  /** Transform events before sending */
  beforeSend?: BeforeSend;
}

/**
 * Event data structure sent to analytics
 */
export interface EventData {
  // Core event data
  event: string;
  timestamp: number;
  site?: string;

  // Page context
  url: string;
  referrer: string;

  // Session & User
  sessionId?: string;
  deviceId?: string;
  userId?: string;

  // Device & Browser (only send if available)
  device?: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    language?: string;
    timezone?: string;
    connectionType?: string;
  };

  // Page info (only send if available)
  page?: {
    title?: string;
    pathname?: string;
    hostname?: string;
    loadTime?: number;
  };

  // UTM parameters (only send if present)
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Custom properties from user
  props?: Record<string, unknown>;

  // Metadata (server events)
  meta?: Record<string, unknown>;
}

/**
 * BeforeSend event types
 */
export interface PageViewEvent {
  type: 'pageview';
  url: string;
  path?: string;
  data?: EventData;
}

export interface CustomEvent {
  type: 'event';
  name: string;
  url: string;
  data?: EventData;
}

export interface IdentifyEvent {
  type: 'identify';
  userId: string;
  traits?: Record<string, unknown>;
  data?: EventData;
}

export type BeforeSendEvent = PageViewEvent | CustomEvent | IdentifyEvent;

/**
 * BeforeSend middleware function
 * Return null to cancel the event, or modified event to send
 */
export type BeforeSend = (event: BeforeSendEvent) => BeforeSendEvent | null | Promise<BeforeSendEvent | null>;

/**
 * Allowed property values for events
 */
export type AllowedPropertyValues = string | number | boolean | null | undefined |
  Record<string, unknown> | Array<unknown>;

/**
 * Environment mode
 */
export type Mode = 'development' | 'production';

/**
 * Network connection interface
 */
export interface NetworkConnection {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Extended Navigator interface
 */
export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

/**
 * Route computation result
 */
export interface RouteInfo {
  /** Computed route pattern (e.g., /user/[id]) */
  route: string;
  /** Actual path (e.g., /user/123) */
  path: string;
  /** Route parameters */
  params?: Record<string, string | string[]>;
} 