# Better Analytics

A micro-analytics JavaScript SDK for tracking page views and events. Framework-agnostic, < 2KB gzip, with specialized adapters for popular frameworks.

## Features

- 🚀 **Lightweight**: < 2KB gzip, tree-shakable
- 🔧 **Framework-agnostic**: Works with any JavaScript project
- ⚛️ **Next.js ready**: Built-in React component with automatic page tracking
- 📦 **Modern**: ESM/CJS dual package, TypeScript support
- 🎯 **Simple**: Three lines to get started
- 🔍 **Rich Analytics**: Automatic session tracking, device fingerprinting, UTM parameters
- ⚡ **Performance**: Built-in page load time tracking and bandwidth optimization
- 🛡️ **Privacy-First**: Lightweight fingerprinting, no cookies, GDPR-friendly

## Installation

```bash
npm install better-analytics
```

## Quick Start

### Framework-agnostic (Vanilla JS)

```javascript
import { init, track } from "better-analytics";

// Initialize with just your site ID (uses Better Analytics SaaS by default)
init({ site: 'my-app' });

// Track custom events (automatically includes rich metadata)
track('button_click', { button: 'signup' });

// Or use your own endpoint
init({ site: 'my-app', endpoint: '/api/collect' });

// Override environment detection (useful for testing)
init({ site: 'my-app', mode: 'development' }); // Forces development mode
init({ site: 'my-app', mode: 'production' });  // Forces production mode
init({ site: 'my-app', mode: 'auto' });        // Auto-detect (default)

// Enable debug logging
init({ site: 'my-app', debug: true });

// Or initialize with automatic pageview
import { initWithPageview } from "better-analytics";
initWithPageview({ site: 'my-app' });
```

### Next.js (Recommended)

**Option 1: Environment Variables (Cleanest)**

```bash
# .env.local
NEXT_PUBLIC_BA_SITE=my-app
# NEXT_PUBLIC_BA_URL=/api/collect  # Optional: only if you want custom endpoint
```

```jsx
import { Analytics } from "better-analytics/next";

// Add to your root layout - uses Better Analytics SaaS by default
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
```

**Option 2: Props (Override env vars)**

```jsx
import { Analytics } from "better-analytics/next";

// Uses Better Analytics SaaS with your site ID
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Analytics site="my-app" />
        {children}
      </body>
    </html>
  );
}

// Or use your own endpoint
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Analytics site="my-app" api="/api/collect" />
        {children}
      </body>
    </html>
  );
}
```

That's it! Page views are tracked automatically, and you can track custom events anywhere:

```javascript
import { track } from "better-analytics/next";

function SignupButton() {
  return (
    <button onClick={() => track('signup_clicked')}>
      Sign Up
    </button>
  );
}
```

## API Reference

### Core SDK (`better-analytics`)

#### `init(config)`

Initialize the analytics SDK.

```javascript
import { init } from "better-analytics";

// Uses Better Analytics SaaS by default
init({
  site: 'my-app'           // Required site identifier
});

// Or use your own endpoint
init({
  site: 'my-app',          // Required site identifier
  endpoint: '/api/collect' // Optional custom endpoint
});
```

**Parameters:**
- `config.site` (string, required): Site identifier for tracking multiple projects
- `config.endpoint` (string, optional): Custom URL endpoint (defaults to Better Analytics SaaS)

#### `initWithPageview(config)`

Initialize the analytics SDK and immediately track a pageview.

```javascript
import { initWithPageview } from "better-analytics";

// Initialize and track pageview in one call (uses Better Analytics SaaS)
initWithPageview({
  site: 'my-app'
});

// Or with custom endpoint
initWithPageview({
  site: 'my-app',
  endpoint: '/api/collect'
});

// Equivalent to:
// init({ site: 'my-app' });
// trackPageview();
```

#### `track(event, props?)`

Track a custom event with optional properties.

```javascript
import { track } from "better-analytics";

// Simple event
track('page_view');

// Event with properties
track('purchase', {
  amount: 99.99,
  currency: 'USD',
  product: 'Pro Plan'
});
```

**Parameters:**
- `event` (string): Event name
- `props` (object, optional): Additional event properties

#### `trackPageview()`

Manually track a page view event.

```javascript
import { trackPageview } from "better-analytics";

trackPageview();
```

### Next.js Component (`better-analytics/next`)

#### `<Analytics />` Component

React component that automatically handles initialization and page tracking.

```jsx
import { Analytics } from "better-analytics/next";

// Environment variables only (recommended)
<Analytics />

// With props (uses Better Analytics SaaS by default)
<Analytics 
  site="my-app"               // Site identifier (or use NEXT_PUBLIC_BA_SITE)
  debug={true}                // Optional: enable console logging
/>

// With custom endpoint
<Analytics 
  site="my-app"               // Site identifier (required)
  api="/api/collect"          // Custom endpoint (optional)
/>

// Custom environment variable names
<Analytics 
  urlEnvVar="CUSTOM_URL"      // Use process.env.CUSTOM_URL instead
  siteEnvVar="CUSTOM_SITE"    // Use process.env.CUSTOM_SITE instead
/>
```

**Props:**
- `site` (string): Site identifier (required, or use NEXT_PUBLIC_BA_SITE)
- `api` (string): Custom analytics endpoint URL (optional, defaults to Better Analytics SaaS)
- `endpoint` (string): Alternative prop name for `api`
- `urlEnvVar` (string): Custom environment variable name for URL
- `siteEnvVar` (string): Custom environment variable name for site
- `debug` (boolean): Enable debug logging to console
- `mode` ('development' | 'production' | 'auto'): Override environment detection
- `beforeSend` (function): Modify or filter events before sending

**Environment Variables:**
- `NEXT_PUBLIC_BA_SITE`: Site identifier (required, e.g., `my-app`)
- `NEXT_PUBLIC_BA_URL`: Custom analytics endpoint (optional, defaults to Better Analytics SaaS)

## Event Data Structure

All events include comprehensive metadata automatically collected:

```typescript
interface EventData {
  // Core event data
  event: string;                 // Event name
  timestamp: number;             // Unix timestamp
  site?: string;                 // Site identifier
  
  // Page context
  url: string;                   // Current page URL
  referrer: string;              // Document referrer
  
  // Session & User tracking
  sessionId?: string;            // 30-minute session ID
  deviceId?: string;             // Persistent device fingerprint
  userId?: string;               // Custom user ID (if set)
  
  // Device & Browser info (only sent if available)
  device?: {
    userAgent?: string;          // Browser user agent
    screenWidth?: number;        // Screen resolution
    screenHeight?: number;
    viewportWidth?: number;      // Browser viewport size
    viewportHeight?: number;
    language?: string;           // Browser language
    timezone?: string;           // User timezone
    connectionType?: string;     // Network connection type
  };
  
  // Page information (only sent if available)
  page?: {
    title?: string;              // Page title
    pathname?: string;           // URL pathname
    hostname?: string;           // Domain name
    loadTime?: number;           // Page load time (ms)
  };
  
  // UTM parameters (only sent if present in URL)
  utm?: {
    source?: string;             // utm_source
    medium?: string;             // utm_medium
    campaign?: string;           // utm_campaign
    term?: string;               // utm_term
    content?: string;            // utm_content
  };
  
  // Custom properties from user
  props?: Record<string, unknown>;
}
```

Example payload with rich metadata:

```json
{
  "event": "button_click",
  "props": { "button": "signup" },
  "timestamp": 1704067200000,
  "url": "https://example.com/pricing?utm_source=google",
  "referrer": "https://google.com",
  "site": "my-app",
  "sessionId": "abc123def456",
  "deviceId": "persistent-device-id",
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
    "title": "Pricing - My App",
    "pathname": "/pricing",
    "hostname": "example.com",
    "loadTime": 1250
  },
  "utm": {
    "source": "google",
    "medium": "cpc"
  }
}
```

**Smart Payload Optimization**: Only data that's actually available is included in the payload, minimizing bandwidth usage.

## Development vs Production Behavior

Better Analytics automatically detects your environment and behaves differently:

### Development Mode
- **Events are logged to console** instead of being sent to your API
- **Rich debug information** is displayed in the console
- **No network requests** are made to your analytics endpoint
- **Perfect for debugging** and verifying your tracking implementation

```javascript
// In development (NODE_ENV=development)
init({ site: 'my-app' });
track('button_click', { button: 'signup' });

// Console output:
// 🚀 Better Analytics initialized in development mode
// 📍 Endpoint: https://better-analytics.app/api/collect (default)
// 🏷️ Site: my-app
// 🔍 Events will be logged to console, not sent to server
// 📊 Better Analytics Event: button_click
// 📦 Data: { event: 'button_click', props: { button: 'signup' }, ... }
```

### Production Mode
- **Events are sent** to your configured endpoint or Better Analytics SaaS
- **Silent operation** with no console logging
- **Optimized for performance** and minimal overhead

```javascript
// In production (NODE_ENV=production)
init({ site: 'my-app' });
track('button_click', { button: 'signup' });

// No console output, event sent to API
```

### Manual Mode Override

You can override the automatic detection:

```javascript
// Force development mode (even in production)
init({ site: 'my-app', mode: 'development' });

// Force production mode (even in development)
init({ site: 'my-app', mode: 'production' });

// Auto-detect based on NODE_ENV (default)
init({ site: 'my-app', mode: 'auto' });
```

### Debug Mode

Enable additional logging in any environment:

```javascript
init({ site: 'my-app', debug: true });

// Shows configuration details and enhanced logging
```

### Next.js Component

The Analytics component also supports mode and debug props:

```jsx
import { Analytics } from "better-analytics/next";

// Development mode with debug logging
<Analytics site="my-app" mode="development" debug={true} />

// Production mode (override auto-detection)
<Analytics site="my-app" mode="production" />

// Auto-detect with debug info
<Analytics site="my-app" debug={true} />
```

## Server-side Endpoint

You'll need to create an endpoint to receive analytics data. Here's a simple Next.js API route example:

```javascript
// app/api/collect/route.js
export async function POST(request) {
  const data = await request.json();
  
  // Store in your database, send to analytics service, etc.
  console.log('Analytics event:', data);
  
  return new Response('OK', { status: 200 });
}
```

## Migration from v0.0.1

Version 0.1.0 introduces a simplified API for Next.js users:

```jsx
// Before (v0.0.1)
import { useBetterAnalytics, init } from "better-analytics/next";

useEffect(() => init({ endpoint: '/api/collect' }), []);
useBetterAnalytics();

// After (v0.1.0)
import { Analytics } from "better-analytics/next";

<Analytics api="/api/collect" />
```

## TypeScript Support

Full TypeScript support is included:

```typescript
import { init, track, AnalyticsConfig, EventData } from "better-analytics";

const config: AnalyticsConfig = {
  site: 'my-app',              // Required
  endpoint: '/api/collect'     // Optional (defaults to Better Analytics SaaS)
};

init(config);

track('custom_event', {
  customProp: 'value'
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Development mode (watch)
pnpm dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 