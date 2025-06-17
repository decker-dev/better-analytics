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

// Initialize with your endpoint
init({ endpoint: '/api/collect', site: 'my-app' });

// Track custom events (automatically includes rich metadata)
track('button_click', { button: 'signup' });

// Or initialize with automatic pageview
import { initWithPageview } from "better-analytics";
initWithPageview({ endpoint: '/api/collect', site: 'my-app' });
```

### Next.js (Recommended)

**Option 1: Environment Variables (Cleanest)**

```bash
# .env.local
NEXT_PUBLIC_BA_URL=/api/collect
NEXT_PUBLIC_BA_SITE=my-app
```

```jsx
import { Analytics } from "better-analytics/next";

// Add to your root layout - auto-configures from env vars
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

// Props take precedence over environment variables
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Analytics api="/api/collect" site="my-app" />
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

init({
  endpoint: '/api/collect', // Your analytics endpoint
  site: 'my-app'           // Optional site identifier
});
```

**Parameters:**
- `config.endpoint` (string): URL endpoint to send analytics data
- `config.site` (string, optional): Site identifier for tracking multiple projects

#### `initWithPageview(config)`

Initialize the analytics SDK and immediately track a pageview.

```javascript
import { initWithPageview } from "better-analytics";

// Initialize and track pageview in one call
initWithPageview({
  endpoint: '/api/collect',
  site: 'my-app'
});

// Equivalent to:
// init({ endpoint: '/api/collect', site: 'my-app' });
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

// With props (override env vars)
<Analytics 
  api="/api/collect"           // Your endpoint (or use NEXT_PUBLIC_BA_URL)
  site="my-app"               // Site identifier (or use NEXT_PUBLIC_BA_SITE)
  debug={true}                // Optional: enable console logging
/>

// Custom environment variable names
<Analytics 
  urlEnvVar="CUSTOM_URL"      // Use process.env.CUSTOM_URL instead
  siteEnvVar="CUSTOM_SITE"    // Use process.env.CUSTOM_SITE instead
/>
```

**Props:**
- `api` (string): Analytics endpoint URL (fallback if NEXT_PUBLIC_BA_URL not set)
- `endpoint` (string): Alternative prop name for `api`
- `site` (string): Site identifier (fallback if NEXT_PUBLIC_BA_SITE not set)
- `urlEnvVar` (string): Custom environment variable name for URL
- `siteEnvVar` (string): Custom environment variable name for site
- `debug` (boolean): Enable debug logging to console
- `mode` ('development' | 'production' | 'auto'): Override environment detection
- `beforeSend` (function): Modify or filter events before sending

**Environment Variables:**
- `NEXT_PUBLIC_BA_URL`: Analytics endpoint (e.g., `/api/collect`)
- `NEXT_PUBLIC_BA_SITE`: Site identifier (e.g., `my-app`)

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
  endpoint: '/api/collect'
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