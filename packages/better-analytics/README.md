# Better Analytics

A **zero-dependency** micro-analytics JavaScript SDK for tracking page views and events. Framework-agnostic, **< 3KB gzipped**, with specialized adapters for popular frameworks and platforms.

## Quick Start

### Web/React
```javascript
import { init, track } from 'better-analytics';

init({ site: 'your-site-id' });
track('button_click', { button: 'signup' });
```

### Next.js
```jsx
import { Analytics } from 'better-analytics/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics site="your-site-id" />
      </body>
    </html>
  );
}
```

### Expo/React Native
```javascript
import { init, track } from 'better-analytics/expo';

init({ site: 'your-site-id' });
track('screen_view', { screen: 'home' });
```

### Server-Side
```javascript
import { trackServer } from 'better-analytics/server';

await trackServer('api_call', { endpoint: '/users' });
```

## Features

- 🚀 **Lightweight**: < 2KB gzip
- 🔧 **Framework-agnostic**: Works with any JS framework
- 📱 **Multi-platform**: Web, React Native, Expo, Server
- 🔒 **Privacy-first**: No cookies, GDPR compliant
- 📊 **Real-time**: Instant analytics
- 🎯 **Simple**: One function to track everything

## Documentation

Full documentation available at [docs.better-analytics.app/docs](https://docs.better-analytics.app/docs)

## License

MIT 