# Better Analytics

A micro-analytics JavaScript SDK for tracking page views and events. Framework-agnostic, < 2KB gzip, with specialized adapters for popular frameworks.

## Features

- 🚀 **Lightweight**: < 2KB gzip, tree-shakable
- 🔧 **Framework-agnostic**: Works with any JavaScript project
- ⚛️ **Next.js ready**: Built-in React component with automatic page tracking
- 📦 **Modern**: ESM/CJS dual package, TypeScript support
- 🎯 **Simple**: Three lines to get started

## Installation

```bash
npm install better-analytics
```

## Quick Start

### Framework-agnostic (Vanilla JS)

```javascript
import { init, track } from "better-analytics";

// Initialize with your endpoint
init({ endpoint: '/api/collect' });

// Track custom events
track('button_click', { button: 'signup' });
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
  endpoint: '/api/collect' // Your analytics endpoint
});
```

**Parameters:**
- `config.endpoint` (string): URL endpoint to send analytics data

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

All events include the following metadata:

```typescript
interface EventData {
  event: string;                 // Event name
  props?: Record<string, any>;   // Custom properties
  timestamp: number;             // Unix timestamp
  url: string;                   // Current page URL
  referrer: string;              // Document referrer
  userAgent: string;             // Browser user agent
  site?: string;                 // Site identifier
}
```

Example payload:

```json
{
  "event": "button_click",
  "props": { "button": "signup" },
  "timestamp": 1704067200000,
  "url": "https://example.com/pricing",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "site": "my-app"
}
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