# better-analytics

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