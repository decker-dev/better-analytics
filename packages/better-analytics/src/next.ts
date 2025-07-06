// Re-export everything from the core module for convenience
export { init, initWithPageview, track, trackPageview, identify, computeRoute } from './index';
export type { AnalyticsConfig, WebEventData as EventData, BeforeSend, BeforeSendEvent, RouteInfo } from './types';

// Re-export server functionality for Next.js users
export {
  initServer,
  trackServer,
  trackPageviewServer,
  identifyServer,
  stitchSession,
  type ServerEventData,
  type ServerTrackOptions,
  type ServerAnalyticsConfig,
} from './server';

// Re-export client components from next-client
export { Analytics, type AnalyticsProps } from './next-client'; 