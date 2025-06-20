# better-analytics

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