# Better Analytics

A **zero-dependency** micro-analytics JavaScript SDK for tracking page views and events. Framework-agnostic, **< 3KB gzipped**, with specialized adapters for popular frameworks and platforms.

## 🚀 Features

- 🪶 **Ultra Lightweight**: < 3KB gzipped core, tree-shakable, zero runtime dependencies
- 🌐 **Framework-agnostic**: Works with any JavaScript project
- ⚛️ **Next.js ready**: Built-in React component with automatic page tracking (~4.8KB gzipped)
- 📱 **Expo/React Native**: Full mobile support with native device info (~1.8KB gzipped)
- 🖥️ **Server-side tracking**: Complete Node.js, Edge Functions support (~1.9KB gzipped)
- 📦 **Modern**: ESM/CJS dual package, TypeScript support, zero runtime dependencies
- 🎯 **Simple**: Three lines to get started
- 🔍 **Rich Analytics**: Automatic session tracking, device fingerprinting, UTM parameters
- ⚡ **Performance**: Built-in page load time tracking and bandwidth optimization
- 🛡️ **Privacy-First**: Lightweight fingerprinting, no cookies, GDPR-friendly
- 📱 **Offline Support**: Automatic retry with localStorage/AsyncStorage queue
- 🔄 **beforeSend Middleware**: Transform or filter events before sending
- 🚦 **Route Computation**: Automatic route pattern detection for SPAs
- 🎯 **Platform-Specific Types**: TypeScript types that only show relevant properties per platform

## 📦 Installation

```bash
npm install better-analytics
# or
pnpm add better-analytics
# or  
yarn add better-analytics
```

## 📊 Bundle Sizes

Better Analytics is designed to be extremely lightweight with **zero runtime dependencies**:

| Module | Minified | Gzipped | Dependencies |
|--------|----------|---------|--------------|
| Core (`better-analytics`) | 7.7KB | **2.6KB** | **0** |
| Next.js (`better-analytics/next`) | 13KB | **4.8KB** | React* |
| Expo (`better-analytics/expo`) | 4.2KB | **1.8KB** | Expo modules* |
| Server (`better-analytics/server`) | 4.3KB | **1.9KB** | **0** |

*React, Next.js and Expo modules are peer dependencies (optional) - they're not bundled with the library.

## 🚀 Quick Start

### Framework-agnostic (Vanilla JS)

```javascript
import { init, track } from "better-analytics";

// Initialize with just your site ID (uses Better Analytics SaaS by default)
init({ site: 'my-app' });

// Track custom events (automatically includes rich metadata)
track('button_click', { button: 'signup' });

// Or use your own endpoint
init({ site: 'my-app', endpoint: '/api/collect' });

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
    return event;
  }
});
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

// Add to your root layout - automatic page tracking
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

**Option 2: Props Override**

```jsx
import { Analytics } from "better-analytics/next";

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

Track custom events anywhere:

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
  
  return <button onClick={handleSignup}>Sign Up</button>;
}
```

### Expo/React Native

**Installation:**

  ```bash
  # For Expo projects (Recommended)
  npm install better-analytics @react-native-async-storage/async-storage
  npx expo install expo-device expo-application expo-localization expo-network expo-router
  ```

**Setup with Provider (Recommended):**

```javascript
import { AnalyticsProvider } from "better-analytics/expo";

export default function RootLayout() {
  return (
    <AnalyticsProvider site="my-app" debug={__DEV__}>
      {/* 🎯 Auto-tracking enabled by default! */}
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
      </Stack>
    </AnalyticsProvider>
  );
}
```

**Or initialize manually:**

```javascript
import { init } from "better-analytics/expo";

// Initialize once in your app entry point
init({
  site: 'my-app',
  debug: __DEV__
  // trackNavigation defaults to true
});
```

**Usage in Components:**

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
  
  return (
    <View>
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
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
```

## 🎯 Platform-Specific Types

Better Analytics provides **platform-specific TypeScript types** to prevent confusion and improve developer experience:

### Web/Browser Types 🌐

```typescript
import { EventData } from "better-analytics";
// or from "better-analytics/next"

// Only web-relevant properties available:
const webEvent: EventData = {
  event: 'button_click',
  device: {
    viewportWidth: 1200,     // ✅ Web-specific
    viewportHeight: 800,     // ✅ Web-specific
    connectionType: '4g'     // ✅ Web-specific
  },
  page: {                    // ✅ Web-specific
    title: 'My Page',
    pathname: '/products',
    loadTime: 1250
  }
  // ❌ No mobile properties (platform, brand, app, etc.)
};
```

### Mobile Types 📱

```typescript
import { EventData } from "better-analytics/expo";

// Only mobile-relevant properties available:
const mobileEvent: EventData = {
  event: 'screen_view',
  device: {
    platform: 'ios',         // ✅ Mobile-specific
    platformVersion: '16.0', // ✅ Mobile-specific
    brand: 'Apple',          // ✅ Mobile-specific
    model: 'iPhone 14',      // ✅ Mobile-specific
    isEmulator: false        // ✅ Mobile-specific
  },
  app: {                     // ✅ Mobile-specific
    version: '1.0.0',
    buildNumber: '123',
    bundleId: 'com.myapp'
  }
  // ❌ No web properties (viewportWidth, page, etc.)
};
```

### Server Types 🖥️

```typescript
import { ServerEventData } from "better-analytics/server";

// Only server-relevant properties available:
const serverEvent: ServerEventData = {
  event: 'api_call',
  server: {                  // ✅ Server-specific
    userAgent: 'Mozilla/5.0...',
    ip: '192.168.1.1',
    country: 'US',
    runtime: 'node',
    framework: 'nextjs'
  },
  user: {                    // ✅ Server context
    id: 'user123',
    sessionId: 'session456'
  }
  // ❌ No client properties (device, page, app, etc.)
};
```

## 📚 API Reference

### Core SDK (`better-analytics`)

#### `init(config)`

Initialize the analytics SDK.

```javascript
import { init } from "better-analytics";

init({
  site: 'my-app',                  // Required site identifier
  endpoint: '/api/collect',        // Optional custom endpoint
  mode: 'auto',                    // 'auto' | 'development' | 'production'
  debug: false,                    // Enable debug logging
  beforeSend: (event) => event     // Transform or filter events
});
```

#### `track(event, props?)`

Track a custom event with optional properties.

```javascript
import { track } from "better-analytics";

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

### Next.js Component (`better-analytics/next`)

```jsx
import { Analytics } from "better-analytics/next";

<Analytics 
  site="my-app"                    // Site identifier
  api="/api/collect"               // Custom endpoint (optional)
  debug={true}                     // Enable console logging
  beforeSend={(event) => event}    // Transform events
/>
```

### Expo/React Native (`better-analytics/expo`)

```javascript
import { AnalyticsProvider, useAnalytics } from "better-analytics/expo";

// Provider (auto-tracking enabled by default)
<AnalyticsProvider site="my-app" debug={__DEV__}>
  <App />
</AnalyticsProvider>

// Hook
const { track, trackScreen, identify } = useAnalytics();
```

### Server SDK (`better-analytics/server`)

```javascript
import { initServer, trackServer } from "better-analytics/server";

initServer({
  site: 'my-app',
  batch: { size: 50, interval: 5000 }
});

await trackServer('api_call', props, {
  request,
  user: { id: 'user123' }
});
```

## 🎨 Event Data Structure

All events include comprehensive metadata automatically collected:

```typescript
// Web Event Structure
{
  event: 'button_click',
  timestamp: 1699123456789,
  site: 'my-app',
  url: 'https://example.com/page',
  referrer: 'https://google.com',
  sessionId: 'abc123',
  deviceId: 'def456',
  userId: 'user123',           // If identified
  device: {
    userAgent: 'Mozilla/5.0...',
    screenWidth: 1920,
    screenHeight: 1080,
    viewportWidth: 1200,       // Web only
    viewportHeight: 800,       // Web only
    language: 'en-US',
    timezone: 'America/New_York',
    connectionType: '4g'       // Web only
  },
  page: {                      // Web only
    title: 'My Page',
    pathname: '/products',
    hostname: 'example.com',
    loadTime: 1250
  },
  utm: {                       // If present in URL
    source: 'google',
    medium: 'cpc',
    campaign: 'summer'
  },
  props: {                     // Custom properties
    button: 'signup',
    color: 'blue'
  }
}
```

## 🚀 Advanced Features

### Development vs Production Behavior

Better Analytics automatically detects your environment:

- **Development Mode**: Events logged to console (no API calls)
- **Production Mode**: Events sent to your configured endpoint
- **Manual Override**: `init({ mode: 'development' })` or `init({ mode: 'production' })`

### Offline Support

Events are automatically queued when offline and sent when connection is restored:

```javascript
// Works automatically - no configuration needed
track('button_click'); // Saved if offline, sent when online
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
```

### Custom beforeSend Middleware

Transform or filter events before they're sent:

```javascript
init({
  site: 'my-app',
  beforeSend: async (event) => {
    // Filter out internal pages
    if (event.url?.includes('/internal')) {
      return null; // Cancel event
    }
    
    // Add custom data
    event.data.customProperty = 'value';
    
    return event;
  }
});
```

### Route Computation

Automatic route pattern detection for dynamic routes:

```javascript
// Automatically converts /user/123 to /user/[id]
// Works with Next.js, React Router, and custom implementations
```

## 🔒 Privacy & GDPR

Better Analytics is designed with privacy in mind:

- ✅ **No Cookies**: Uses localStorage and sessionStorage only
- ✅ **Lightweight Fingerprinting**: Minimal device identification
- ✅ **No PII**: Doesn't collect personal information automatically
- ✅ **User Control**: Easy event filtering with beforeSend
- ✅ **Data Ownership**: Use your own endpoint or Better Analytics SaaS

## 🛠️ Why Better Analytics?

### vs Google Analytics
- 🪶 **100x Lighter**: 3KB vs 300KB+ bundle size
- ⚡ **No Performance Impact**: Zero render blocking
- 🔒 **Privacy-First**: No cookies, GDPR-friendly
- 💻 **Developer-Friendly**: Simple API, great TypeScript support

### vs Vercel Analytics
- 📱 **Mobile Support**: Works with React Native/Expo
- 🖥️ **Server-Side**: Full backend tracking
- 🎯 **Platform-Specific Types**: Better TypeScript experience
- 🔧 **Self-Hosted**: Use your own infrastructure

### vs Mixpanel/Amplitude
- 🎯 **Micro-Analytics**: Focused on essential tracking
- 💰 **Cost-Effective**: No per-event pricing
- 🚀 **Easy Setup**: Three lines to get started
- 📦 **Zero Dependencies**: No vendor lock-in

## 📖 Examples

### E-commerce Tracking

```javascript
// Product view
track('product_viewed', {
  product_id: 'abc123',
  product_name: 'Wireless Headphones',
  category: 'electronics',
  price: 99.99
});

// Purchase
track('purchase_completed', {
  order_id: 'order_456',
  total: 199.98,
  items: 2,
  payment_method: 'credit_card'
});
```

### SaaS Application

```javascript
// Feature usage
track('feature_used', {
  feature: 'export_data',
  plan: 'pro',
  user_type: 'admin'
});

// Subscription events
track('subscription_upgraded', {
  from_plan: 'basic',
  to_plan: 'pro',
  annual: true
});
```

### Mobile App (React Native)

```javascript
// Screen navigation
trackScreen('ProductDetail', {
  product_id: 'abc123',
  category: 'electronics'
});

// App events
track('app_opened', {
  source: 'push_notification',
  campaign: 'flash_sale'
});
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  <strong>Made with ❤️ for developers who value simplicity and performance</strong>
</div> 