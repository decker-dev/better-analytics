# Better Analytics

A micro-analytics JavaScript SDK that developers can drop into any website.

## Features

- 🚀 **Micro SDK**: < 2KB gzip, framework-agnostic
- 📦 **Tree-shakable**: ESM + UMD bundles
- ⚡ **Zero dependencies**: Pure JavaScript
- 🔧 **TypeScript**: Full type support
- 🎯 **Simple API**: Just 3 functions - `init()`, `trackPageview()`, `track()`
- 🔌 **Next.js adapter**: React hook for automatic page tracking

## Quick Start

### Installation

```bash
npm install better-analytics
```

### Basic Usage

```javascript
import { init, track, trackPageview } from 'better-analytics';

// Initialize with your endpoint
init({ endpoint: 'https://your-api.com/collect' });

// Track custom events
track('button_click', { button: 'signup' });

// Manual page view tracking
trackPageview();
```

### Next.js Usage

```bash
npm install better-analytics
```

```javascript
// app/layout.tsx
import { useEffect } from 'react';
import { init, useBetterAnalytics } from 'better-analytics/next';

export default function RootLayout({ children }) {
  useEffect(() => {
    init({ endpoint: '/api/collect' });
  }, []);

  useBetterAnalytics(); // Auto-tracks route changes

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

## Packages

This monorepo contains:

- `better-analytics` - Core SDK with subpath exports (packages/sdk)
  - `better-analytics` - Core functionality
  - `better-analytics/next` - Next.js adapter
- `web` - Demo Next.js app (apps/web)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development server
pnpm dev
```

## Demo

The `apps/web` directory contains a working Next.js demo that shows the SDK in action. Run `pnpm dev` and visit http://localhost:3000 to see analytics events being tracked in real-time.

## Success Criterion

**"npm install, paste five lines, events reach my own URL."** ✅

This SDK achieves exactly that - minimal setup, maximum functionality.

## Architecture

- **Framework-agnostic core**: Works with vanilla JS, React, Vue, Svelte, etc.
- **Compressed JSON**: All events sent via POST with minimal payload
- **Your own endpoint**: Complete control over data storage and processing
- **No external dependencies**: No tracking pixels, no third-party services

## License

MIT
