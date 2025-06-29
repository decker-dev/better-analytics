# Better Analytics

A micro-analytics JavaScript SDK for tracking page views and events. Framework-agnostic, < 2KB gzip, with specialized adapters for popular frameworks.

## Features

- 🚀 **Lightweight**: < 2KB gzip, tree-shakable
- 🔧 **Framework-agnostic**: Works with any JavaScript project
- ⚛️ **Next.js ready**: Built-in React component with automatic page tracking
- 🖥️ **Server-side tracking**: Full support for Node.js, Edge Functions, and more
- 📦 **Modern**: ESM/CJS dual package, TypeScript support
- 🎯 **Simple**: Three lines to get started
- 🔍 **Rich Analytics**: Automatic session tracking, device fingerprinting, UTM parameters
- ⚡ **Performance**: Built-in page load time tracking and bandwidth optimization
- 🛡️ **Privacy-First**: Lightweight fingerprinting, no cookies, GDPR-friendly
- 📱 **Offline Support**: Automatic retry with localStorage queue
- 🔄 **beforeSend Middleware**: Transform or filter events before sending
- 🚦 **Route Computation**: Automatic route pattern detection for SPAs

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

// Filter or transform events before sending
init({ 
  site: 'my-app',
  beforeSend: (event) => {
    // Cancel specific events
    if (event.type === 'pageview' && event.url.includes('/admin')) {
      return null;
    }
    // Transform event data
    if (event.data) {
      event.data.timestamp = Date.now();
    }
    return event;
  }
});

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
        <Analytics 
          site="my-app"
          beforeSend={(event) => {
            // Filter out admin pages
            if (event.url?.includes('/admin')) return null;
            return event;
          }}
        />
        {children}
      </body>
    </html>
  );
}
```

That's it! Page views are tracked automatically, and you can track custom events anywhere:

```javascript
import { track, identify } from "better-analytics/next";

function SignupButton() {
  const handleSignup = () => {
    // Identify the user
    identify('user123', { 
      email: 'user@example.com',
      plan: 'pro' 
    });
    
    // Track custom event
    track('signup_clicked', {
      referral: 'homepage'
    });
  };
  
  return (
    <button onClick={handleSignup}>
      Sign Up
    </button>
  );
}
```

### Server-Side Tracking

Perfect for API routes, server actions, and edge functions:

```javascript
import { initServer, trackServer } from "better-analytics/server";

// Initialize once in your server
initServer({ 
  site: 'my-app',
  // Optional: enable batching for better performance
  batch: {
    size: 50,      // Send events in batches of 50
    interval: 5000 // Or every 5 seconds
  }
});

// Track from API routes
export async function POST(request) {
  const data = await request.json();
  
  // Track with automatic header extraction
  await trackServer('api_call', {
    endpoint: '/api/users',
    method: 'POST'
  }, {
    request, // Headers are extracted automatically
    user: {
      id: data.userId,
      email: data.email
    }
  });
  
  return Response.json({ success: true });
}

// Track from middleware
export async function middleware(request) {
  await trackServer('page_view', {
    path: request.nextUrl.pathname
  }, {
    request,
    waitUntil: (promise) => event.waitUntil(promise) // Edge function support
  });
}

// Express.js middleware
import { expressMiddleware } from "better-analytics/server";

app.use(expressMiddleware());
app.post('/api/users', async (req, res) => {
  // Track with session continuity
  await req.track('user_created', { plan: 'pro' });
  res.json({ success: true });
});
```

## API Reference

### Core SDK (`better-analytics`)

#### `init(config)`

Initialize the analytics SDK.

```javascript
import { init } from "better-analytics";

init({
  site: 'my-app',                  // Required site identifier
  endpoint: '/api/collect',        // Optional custom endpoint (defaults to Better Analytics SaaS)
  mode: 'auto',                    // 'auto' | 'development' | 'production'
  debug: false,                    // Enable debug logging
  beforeSend: (event) => event     // Transform or filter events
});
```

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

#### `identify(userId, traits?)`

Identify a user for all future events.

```javascript
import { identify } from "better-analytics";

identify('user123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro'
});
```

#### `trackPageview(path?)`

Manually track a page view event.

```javascript
import { trackPageview } from "better-analytics";

trackPageview(); // Uses current path
trackPageview('/custom/path'); // Custom path
```

#### `computeRoute(pathname, params)`

Compute route patterns for SPAs (useful for custom implementations).

```javascript
import { computeRoute } from "better-analytics";

// Convert /user/123 to /user/[id]
const route = computeRoute('/user/123', { id: '123' });
// Returns: '/user/[id]'
```

### Server SDK (`better-analytics/server`)

#### `initServer(config)`

Initialize server-side analytics.

```javascript
import { initServer } from "better-analytics/server";

initServer({
  site: 'my-app',                  // Required site identifier
  endpoint: '/api/collect',        // Optional custom endpoint
  apiKey: 'secret-key',           // Optional API key for authentication
  debug: false,                    // Enable debug logging
  batch: {                         // Optional batching configuration
    size: 50,                      // Batch size (default: 50)
    interval: 5000,                // Batch interval in ms (default: 5000)
    maxRetries: 3                  // Max retry attempts (default: 3)
  },
  runtime: 'edge'                  // Override runtime detection
});
```

#### `trackServer(event, props?, options?)`

Track events from server-side code.

```javascript
import { trackServer } from "better-analytics/server";

await trackServer('api_call', {
  endpoint: '/api/users',
  duration: 123
}, {
  headers: request.headers,        // Extract client info from headers
  user: {                         // User context
    id: 'user123',
    email: 'user@example.com',
    sessionId: 'session456',      // For session stitching
    deviceId: 'device789'         // For device continuity
  },
  waitUntil: promise => ctx.waitUntil(promise), // Edge function support
  meta: {                         // Additional metadata
    server: 'api-1',
    version: '2.0.0'
  }
});
```

#### `stitchSession(sessionId?, deviceId?)`

Helper to maintain session continuity between client and server.

```javascript
import { stitchSession } from "better-analytics/server";

// In your API route
const sessionData = stitchSession(
  req.cookies.ba_session,
  req.cookies.ba_device
);

await trackServer('api_call', props, {
  user: sessionData
});
```

### Next.js Component (`better-analytics/next`)

#### `<Analytics />` Component

React component that automatically handles initialization and page tracking.

```jsx
import { Analytics } from "better-analytics/next";

<Analytics 
  site="my-app"                    // Site identifier (or use NEXT_PUBLIC_BA_SITE)
  api="/api/collect"               // Custom endpoint (optional)
  debug={true}                     // Enable console logging
  mode="production"                // Override environment detection
  beforeSend={(event) => {         // Transform events before sending
    console.log('Event:', event);
    return event;
  }}
/>
```

**Environment Variables:**
- `NEXT_PUBLIC_BA_SITE`: Site identifier (required, e.g., `my-app`)
- `NEXT_PUBLIC_BA_URL`: Custom analytics endpoint (optional)

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
  
  // Server-side specific data
  server?: {
    userAgent?: string;          // Server-extracted UA
    ip?: string;                 // Client IP
    country?: string;            // Geo location
    runtime?: string;            // node | edge | cloudflare
    framework?: string;          // nextjs | nuxt | etc
  };
}
```

## Advanced Features

### Offline Support

Events are automatically queued when offline and sent when connection is restored:

```javascript
// Events are saved to localStorage automatically
track('button_click'); // Saved if offline

// Manual offline handling
if (!navigator.onLine) {
  console.log('Event will be sent when online');
}
```

### Event Batching (Server-Side)

Improve performance by batching server events:

```javascript
initServer({
  site: 'my-app',
  batch: {
    size: 100,      // Send when 100 events accumulate
    interval: 10000 // Or every 10 seconds
  }
});

// Events are automatically batched
for (let i = 0; i < 1000; i++) {
  trackServer('bulk_operation', { index: i }); // Non-blocking
}
```

### Route Computation

Automatic route pattern detection for dynamic routes:

```javascript
// Next.js example
// Path: /user/123/posts/456
// Params: { userId: '123', postId: '456' }
// Computed: /user/[userId]/posts/[postId]

// This happens automatically in the Analytics component
// But you can use it manually:
import { computeRoute } from "better-analytics";

const route = computeRoute('/user/123/posts/456', {
  userId: '123',
  postId: '456'
});
// Returns: '/user/[userId]/posts/[postId]'
```

### Custom beforeSend Middleware

Transform or filter events before they're sent:

```javascript
init({
  site: 'my-app',
  beforeSend: async (event) => {
    // Add custom data to all events
    if (event.data) {
      event.data.customProperty = 'value';
    }
    
    // Filter out certain pages
    if (event.type === 'pageview' && event.url?.includes('/internal')) {
      return null; // Cancel event
    }
    
    // Async transformations
    if (event.type === 'identify') {
      const enrichedData = await fetchUserData(event.userId);
      event.traits = { ...event.traits, ...enrichedData };
    }
    
    return event;
  }
});
```

## Development vs Production Behavior

Better Analytics automatically detects your environment and behaves differently:

### Development Mode
- **Events are logged to console** instead of being sent to your API
- **Rich debug information** is displayed in the console
- **No network requests** are made to your analytics endpoint
- **Perfect for debugging** and verifying your tracking implementation

### Production Mode
- **Events are sent** to your configured endpoint or Better Analytics SaaS
- **Silent operation** with no console logging
- **Optimized for performance** and minimal overhead

### Manual Mode Override

```javascript
// Force development mode (even in production)
init({ site: 'my-app', mode: 'development' });

// Force production mode (even in development)
init({ site: 'my-app', mode: 'production' });
```

## TypeScript Support

Full TypeScript support with comprehensive types:

```typescript
import { 
  init, 
  track, 
  AnalyticsConfig, 
  EventData,
  BeforeSend,
  BeforeSendEvent 
} from "better-analytics";

const config: AnalyticsConfig = {
  site: 'my-app',
  beforeSend: (event: BeforeSendEvent) => {
    console.log(event.type); // 'pageview' | 'event' | 'identify'
    return event;
  }
};

init(config);

// Server-side types
import { 
  ServerEventData,
  ServerTrackOptions 
} from "better-analytics/server";
```

## Migration from v0.5.0

The v0.6.0 release adds powerful new features while maintaining backward compatibility:

### New Features
- **Server-Side Tracking**: Full Node.js and Edge Function support
- **beforeSend Middleware**: Transform or filter events
- **Offline Support**: Automatic retry with localStorage queue
- **Route Computation**: Automatic pattern detection for SPAs
- **Event Batching**: Server-side performance optimization
- **identify() API**: User identification and traits

### Breaking Changes
None - all existing code will continue to work.

### New Imports
```javascript
// Server-side tracking
import { initServer, trackServer } from "better-analytics/server";

// User identification
import { identify } from "better-analytics";
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 