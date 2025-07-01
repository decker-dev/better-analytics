# better-analytics

## 0.7.0

### Major Features

- **📱 Expo Support: Complete Expo integration optimized for the Expo ecosystem with native device information
- **🎯 Platform-Specific Types**: Separate TypeScript types for web, mobile, and server to prevent confusion and improve DX  
- **🔄 Navigation Tracking**: Automatic screen navigation tracking for mobile apps
- **💾 Mobile Offline Support**: AsyncStorage-based event queuing for offline scenarios
- **📱 Native Device Info**: Rich device metadata using Expo modules (Device, Application, Localization, Network)
- **🎯 Provider Pattern**: React Context-based AnalyticsProvider for app-wide configuration

### New Expo APIs

#### Installation
```bash
# For Expo projects (Recommended)
npm install better-analytics @react-native-async-storage/async-storage
npx expo install expo-device expo-application expo-localization expo-network
```

#### Provider Setup (Recommended)
```javascript
import { AnalyticsProvider } from "better-analytics/expo";

export default function App() {
  return (
    <AnalyticsProvider 
      site="my-app"
      debug={__DEV__}
      trackNavigation={true}
    >
      <YourAppContent />
    </AnalyticsProvider>
  );
}
```

#### Manual Setup
```javascript
import { initExpo } from "better-analytics/expo";

initExpo({
  site: 'my-app',
  debug: __DEV__,
  trackNavigation: true
});
```

#### Component Usage
```javascript
import { useAnalytics } from "better-analytics/expo";

function HomeScreen() {
  const { track, trackScreen, identify } = useAnalytics();
  
  useEffect(() => {
    trackScreen('Home');
  }, []);
  
  const handleSignup = async () => {
    await identify('user123', { 
      email: 'user@example.com',
      platform: Platform.OS 
    });
    
    track('signup_completed', {
      method: 'email',
      screen: 'home'
    });
  };
}
```

### Platform-Specific TypeScript Types

#### Web/Browser Types (Core & Next.js)
```typescript
import { EventData } from "better-analytics";
// Only web-relevant properties: viewportWidth, page, connectionType

const webEvent: EventData = {
  device: {
    viewportWidth: 1200,     // ✅ Web-specific
    connectionType: '4g'     // ✅ Web-specific
  },
  page: {                    // ✅ Web-specific
    title: 'My Page',
    loadTime: 1250
  }
  // ❌ No mobile properties (platform, brand, app, etc.)
};
```

#### Mobile Types (Expo)
```typescript
import { EventData } from "better-analytics/expo";
// Only mobile-relevant properties: platform, brand, model, app

const mobileEvent: EventData = {
  device: {
    platform: 'ios',         // ✅ Mobile-specific
    brand: 'Apple',          // ✅ Mobile-specific
    model: 'iPhone 14'       // ✅ Mobile-specific
  },
  app: {                     // ✅ Mobile-specific
    version: '1.0.0',
    bundleId: 'com.myapp'
  }
  // ❌ No web properties (viewportWidth, page, etc.)
};
```

#### Server Types
```typescript
import { ServerEventData } from "better-analytics/server";
// Only server-relevant properties: server context, user session

const serverEvent: ServerEventData = {
  server: {                  // ✅ Server-specific
    runtime: 'node',
    framework: 'nextjs'
  },
  user: {                    // ✅ Server context
    sessionId: 'session456'
  }
  // ❌ No client properties (device, page, app, etc.)
};
```

### Mobile-Specific Features

- **Native Device Information**: Platform, screen dimensions, device model, brand, OS version
- **App Metadata**: App version, build number, bundle ID
- **Session Management**: Persistent sessions with 30-minute timeout using AsyncStorage
- **Device Fingerprinting**: Lightweight device ID generation and persistence
- **Network Awareness**: Automatic offline detection and event queuing
- **Screen Tracking**: Specialized `trackScreen()` for mobile navigation patterns

### Technical Improvements

- **Type Safety**: Platform-specific types prevent confusion and improve IntelliSense
- **Zero Web Dependencies**: Separate mobile-optimized bundle with React Native APIs
- **Expo Modules**: Full integration with Expo's device information APIs
- **Graceful Fallbacks**: Works even when optional Expo modules are unavailable
- **Bundle Size**: Only 1.8KB gzipped for the Expo adapter

### Package Structure

```
better-analytics/          # Client SDK (Web-only types)
better-analytics/next      # Next.js component (Web-only types)
better-analytics/server    # Server SDK (Server-only types)
better-analytics/expo      # Expo SDK (Mobile-only types) (NEW)
```

This release extends Better Analytics to mobile platforms while introducing platform-specific types that improve developer experience and prevent confusion between web, mobile, and server contexts.

## 0.6.0

### Major Features

- **🖥️ Server-Side Tracking**: Complete server-side analytics for Node.js, Edge Functions, Cloudflare Workers
- **🔄 beforeSend Middleware**: Transform or filter events before sending
- **📱 Offline Support**: Automatic retry with localStorage queue
- **🚦 Route Computation**: Automatic route pattern detection for SPAs (e.g., `/user/[id]`)
- **📦 Event Batching**: Server-side performance optimization
- **👤 User Identification**: New `identify()` API for user tracking
- **⏱️ Queue System**: Capture events before SDK initialization
- **🔗 Session Stitching**: Maintain session continuity between client and server

### New APIs

#### Client-Side
```javascript
// Initialize with beforeSend
init({
  site: 'my-app',
  beforeSend: (event) => {
    if (event.url?.includes('/admin')) return null;
    return event;
  }
});

// Identify users
identify('user123', {
  email: 'user@example.com',
  plan: 'pro'
});

// Compute route patterns
computeRoute('/user/123', { id: '123' }); // Returns: '/user/[id]'
```

#### Server-Side
```javascript
import { initServer, trackServer } from "better-analytics/server";

// Initialize with batching
initServer({
  site: 'my-app',
  batch: { size: 50, interval: 5000 }
});

// Track from API routes
await trackServer('api_call', props, {
  request,
  user: { id: 'user123', sessionId: 'session456' }
});

// Express.js middleware
app.use(expressMiddleware());
```

### Framework Improvements

#### Next.js
- **Suspense Support**: Proper SSR handling
- **Route Computation**: Automatic dynamic route detection
- **Enhanced Debugging**: Rich console output with route info

```jsx
<Analytics 
  site="my-app"
  beforeSend={(event) => event}
  mode="production"
  debug={true}
/>
```

### Technical Improvements

- **Modular Architecture**: Separate entry points for client/server
- **Tree-Shakeable**: Import only what you need
- **TypeScript First**: Complete type definitions
- **Zero Breaking Changes**: Full backward compatibility

### Package Structure

```
better-analytics/          # Client SDK
better-analytics/next      # Next.js component
better-analytics/server    # Server SDK (NEW)
```

This release transforms Better Analytics from a simple client-side tracker to a complete analytics solution suitable for modern full-stack applications.

## 0.5.0

### Major Changes

- **Development vs Production Mode Handling**: Similar to Vercel Analytics, events are now only logged to console in development mode instead of being sent to the API
- **Smart Environment Detection**: Automatically detects `NODE_ENV` to determine behavior
- **Manual Mode Override**: Force development or production mode regardless of environment
- **Enhanced Debug Mode**: Rich logging and configuration details in development

### Breaking Changes

None - all existing APIs remain unchanged.

### New Features

#### Development Mode (NODE_ENV=development)
```javascript
init({ site: 'my-app' });
track('button_click', { button: 'signup' });

// Console output (no API calls):
// 🚀 Better Analytics initialized in development mode
// 📊 Better Analytics Event: button_click
// 📦 Data: { event: 'button_click', props: { button: 'signup' }, ... }
```

#### Production Mode (NODE_ENV=production)
```javascript
init({ site: 'my-app' });
track('button_click', { button: 'signup' });

// Silent operation, events sent to API
```

#### Manual Mode Override
```javascript
// Force development mode (logs to console)
init({ site: 'my-app', mode: 'development' });

// Force production mode (sends to API)
init({ site: 'my-app', mode: 'production' });

// Auto-detect based on NODE_ENV (default)
init({ site: 'my-app', mode: 'auto' });
```

#### Enhanced Debug Mode
```javascript
// Enable debug logging in any environment
init({ site: 'my-app', debug: true });

// Next.js component
<Analytics site="my-app" mode="development" debug={true} />
```

### Configuration Changes

- **mode**: New optional parameter (`'auto' | 'development' | 'production'`)
- **debug**: New optional parameter for enhanced logging
- All existing parameters remain unchanged

### Developer Experience

- **Perfect for Development**: No unwanted API calls during development
- **Easy Debugging**: Rich console output shows exactly what data is being tracked
- **Production Ready**: Silent, optimized operation in production
- **Flexible Override**: Manual control when needed for testing

This update significantly improves the development experience while maintaining all existing functionality.

## 0.4.0

### Major Changes

- **SaaS Integration**: Now uses Better Analytics SaaS (`https://better-analytics.app/api/collect`) as the default endpoint
- **Required Site Parameter**: The `site` parameter is now required, while `endpoint` is optional
- **Simplified Setup**: You can now start tracking with just `init({ site: 'my-app' })` - no endpoint configuration needed unless you want to use your own server

### Breaking Changes

```javascript
// Before (v0.3.0 and earlier)
init({ endpoint: '/api/collect', site: 'my-app' });

// After (v0.4.0) - Uses Better Analytics SaaS by default
init({ site: 'my-app' });

// Or with custom endpoint
init({ site: 'my-app', endpoint: '/api/collect' });
```

### New Features

#### Default SaaS Integration
```javascript
import { init, track } from "better-analytics";

// Automatically sends to Better Analytics SaaS
init({ site: 'my-app' });
track('user_signup', { plan: 'pro' });
```

#### Simplified Next.js Setup
```jsx
import { Analytics } from "better-analytics/next";

// Just add your site ID - works immediately
<Analytics site="my-app" />

// Environment variable approach
// .env.local: NEXT_PUBLIC_BA_SITE=my-app
<Analytics />
```

### Configuration Changes

- **site**: Now required (was optional)
- **endpoint**: Now optional with default value `https://better-analytics.app/api/collect` (was required)
- Better error messages when site parameter is missing

### Migration Guide

1. **Environment Variables**: Change `NEXT_PUBLIC_BA_URL` to optional, keep `NEXT_PUBLIC_BA_SITE` as required
2. **API Calls**: Put `site` parameter first in all `init()` calls
3. **Remove Manual Endpoints**: You can remove custom `/api/collect` endpoints unless you need custom processing

This update makes Better Analytics much easier to get started with while maintaining full flexibility for custom implementations.

## 0.3.0

### Major Changes

- **Enhanced Session & Device Tracking**: Persistent session IDs with 30-minute timeout and lightweight device fingerprinting
- **Rich Event Metadata**: Comprehensive device, page, and UTM parameter collection with smart payload optimization
- **Advanced Browser Detection**: Automatic collection of screen resolution, viewport size, language, timezone, and connection type
- **Performance Monitoring**: Built-in page load time tracking via Performance API
- **Smart Data Structure**: Optimized event payload that only includes available data to minimize bandwidth

### New Features

#### Session & Device Tracking
```javascript
// Automatic session management (30-minute sessions)
// Persistent device IDs with lightweight fingerprinting
// All handled automatically - no configuration needed

// Events now include:
{
  "sessionId": "abc123...",    // 30-minute session
  "deviceId": "def456...",     // Persistent device ID
  // ... rest of event data
}
```

#### Rich Device & Browser Information
```javascript
// Automatically collected when available:
{
  "device": {
    "userAgent": "Mozilla/5.0...",
    "screenWidth": 1920,
    "screenHeight": 1080,
    "viewportWidth": 1200,
    "viewportHeight": 800,
    "language": "en-US",
    "timezone": "America/New_York",
    "connectionType": "4g"
  },
  "page": {
    "title": "My Page",
    "pathname": "/products",
    "hostname": "example.com",
    "loadTime": 1250  // milliseconds
  }
}
```

#### UTM Parameter Extraction
```javascript
// Automatically extracts UTM parameters from URLs:
// https://example.com?utm_source=google&utm_medium=cpc

{
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "summer",
    "term": "analytics",
    "content": "banner"
  }
}
```

#### New Initialization Method
```javascript
import { initWithPageview } from "better-analytics";

// Initialize and immediately track pageview
initWithPageview({ endpoint: '/api/collect' });

// Equivalent to:
// init({ endpoint: '/api/collect' });
// trackPageview();
```

### Performance & Optimization

- **Bandwidth Optimization**: Only sends data that's actually available (no empty objects)
- **Memory Efficient**: Lightweight fingerprinting using existing browser APIs
- **Storage Resilient**: Graceful fallbacks when localStorage is unavailable
- **SSR Compatible**: All browser-specific code safely handles server-side rendering

### Developer Experience

- **Enhanced Error Handling**: Better error messages and development-mode logging
- **TypeScript Improvements**: More detailed type definitions for event data structure
- **Test Coverage**: Comprehensive test suite covering all new features

### Backward Compatibility

All existing APIs remain unchanged. New features are automatically enabled with no breaking changes.

## 0.2.0

### Minor Changes

- **Enhanced Developer Experience**: Automatic warning messages in development mode when analytics endpoint is not configured
- **Custom Environment Variables**: Support for custom environment variable names via `urlEnvVar` and `siteEnvVar` props
- **Environment Mode Override**: New `mode` prop to override automatic environment detection
- **Event Filtering**: New `beforeSend` prop to modify or filter events before sending
- **Improved Debugging**: No longer requires `debug={true}` flag to see configuration warnings during development
- **Smart Warning System**: Warnings appear automatically when `NODE_ENV=development`, detailed debug info still available with `debug={true}`

### New Features

```jsx
// Custom environment variables
<Analytics 
  urlEnvVar="CUSTOM_ANALYTICS_URL" 
  siteEnvVar="CUSTOM_SITE_ID" 
/>

// Environment mode override
<Analytics mode="production" />  // Force production mode

// Event filtering and modification
<Analytics 
  beforeSend={(event) => {
    // Modify event or return null to ignore
    if (event.event === 'sensitive_action') return null;
    return { ...event, modified: true };
  }}
/>

// Enhanced debugging
<Analytics debug={true} />  // Detailed logs + env var inspection
```

### Developer Experience Improvements

```jsx
// Before: Silent failure in development
<Analytics />  // Nothing happens if NEXT_PUBLIC_BA_URL is missing

// After: Automatic warnings in development  
<Analytics />  // Shows warning: "⚠️ Better Analytics: No endpoint provided..."
```

These improvements provide more flexibility for different deployment scenarios and better development experience.

## 0.1.0

### Major Changes

- **BREAKING**: Removed `useBetterAnalytics` hook in favor of `<Analytics />` component
- **NEW**: Analytics component now accepts configuration props directly (like Vercel Analytics)
- **SIMPLIFIED**: No more manual `init()` calls needed - just pass props to `<Analytics />`

### Features

- **better-analytics**: Framework-agnostic SDK < 2KB gzip with subpath exports  
- **better-analytics/next**: Next.js `<Analytics />` component with automatic page tracking

### Usage

```bash
npm install better-analytics
```

```javascript
// Core functionality
import { init, track } from "better-analytics";

// Next.js component (NEW - no hooks needed!)
import { Analytics } from "better-analytics/next";

// In your layout:
<Analytics api="/api/collect" />
```

**Migration from v1.x:**
```javascript
// Before (v1.x)
import { useBetterAnalytics, init } from "better-analytics/next";

useEffect(() => init({ endpoint: '/api/collect' }), []);
useBetterAnalytics();

// After (v2.x)
import { Analytics } from "better-analytics/next";

<Analytics api="/api/collect" />
```

Success criterion achieved: "npm install, paste three lines, events reach my own URL." ✅

## 0.0.1

### Major Changes

- Initial Release 🚀

  Better Analytics SDK - A micro-analytics JavaScript SDK for tracking page views and events.

  ## Features

  - **better-analytics**: Framework-agnostic SDK < 2KB gzip with subpath exports
  - **better-analytics/next**: Next.js adapter with automatic page tracking

  ## Usage

  ```bash
  npm install better-analytics
  ```

  ```javascript
  // Core functionality
  import { init, track } from "better-analytics";

  // Next.js adapter
  import { useBetterAnalytics } from "better-analytics/next";
  ```

  Success criterion achieved: "npm install, paste five lines, events reach my own URL." ✅