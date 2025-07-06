// Re-export client components from next-client (for layouts and client-side usage)
export { Analytics, type AnalyticsProps } from './next-client';

// Re-export core client functions for use in components
export { init, initWithPageview, track, trackPageview, identify, computeRoute } from './index';
export type { AnalyticsConfig, WebEventData as EventData, BeforeSend, BeforeSendEvent, RouteInfo } from './types';

// Re-export Next.js server functions with auto-initialization (for server actions, API routes, etc.)
export {
  trackServer,
  trackPageviewServer,
  identifyServer,
  initServer,
  stitchSession,
  type ServerEventData,
  type ServerTrackOptions,
  type ServerAnalyticsConfig,
} from './next-server'; 