# better-analytics

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