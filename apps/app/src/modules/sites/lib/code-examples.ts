interface CodeExample {
  title: string;
  language: string;
  code: string;
  description?: string;
}

/**
 * Get code examples for Better Analytics integration
 * @param siteKey - The BA_ site key to inject into examples
 * @param apiEndpoint - The API endpoint URL
 */
export function getCodeExamples(siteKey: string, apiEndpoint: string): Record<string, CodeExample> {
  const isLocalhost = apiEndpoint.includes('localhost');
  const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://yourdomain.com';

  return {
    'Next.js': {
      title: 'Next.js App Router',
      language: 'typescript',
      description: 'Add to your root layout.tsx file',
      code: `import { Analytics } from 'better-analytics/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Analytics 
          site="${siteKey}"
          api="${apiEndpoint}"
        />
        {children}
      </body>
    </html>
  )
}`
    },

    'React': {
      title: 'React Component',
      language: 'typescript',
      description: 'Add to your main App component',
      code: `import { useEffect } from 'react'
import { init, track } from 'better-analytics'

function App() {
  useEffect(() => {
    // Initialize Better Analytics
    init({
      endpoint: '${apiEndpoint}',
      site: '${siteKey}'
    })
    
    // Track page view
    track('pageview')
  }, [])

  const handleButtonClick = () => {
    // Track custom events
    track('button_click', { 
      section: 'hero',
      action: 'cta_clicked' 
    })
  }

  return (
    <div>
      <h1>My App</h1>
      <button onClick={handleButtonClick}>
        Click me!
      </button>
    </div>
  )
}`
    },

    'Vanilla JS': {
      title: 'Vanilla JavaScript',
      language: 'javascript',
      description: 'Add to your HTML file or main JS bundle',
      code: `import { init, track } from 'better-analytics'

// Initialize Better Analytics
init({
  endpoint: '${apiEndpoint}',
  site: '${siteKey}'
})

// Track page view
track('pageview')

// Track custom events
document.getElementById('my-button')?.addEventListener('click', () => {
  track('button_click', {
    element: 'my-button',
    page: window.location.pathname
  })
})

// Track form submissions
document.getElementById('contact-form')?.addEventListener('submit', () => {
  track('form_submit', {
    form: 'contact',
    page: window.location.pathname
  })
})`
    },

    'HTML Script': {
      title: 'HTML Script Tag',
      language: 'html',
      description: 'Add this script tag to your HTML head',
      code: `<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  
  <!-- Better Analytics -->
  <script type="module">
    import { init, track } from 'https://cdn.jsdelivr.net/npm/better-analytics@latest/dist/index.js'
    
    // Initialize
    init({
      endpoint: '${apiEndpoint}',
      site: '${siteKey}'
    })
    
    // Track page view
    track('pageview')
    
    // Track interactions
    window.trackEvent = (event, props) => track(event, props)
  </script>
</head>
<body>
  <h1>My Website</h1>
  
  <!-- Track button clicks -->
  <button onclick="trackEvent('button_click', { button: 'hero-cta' })">
    Get Started
  </button>
</body>
</html>`
    },

    'Vue.js': {
      title: 'Vue.js 3',
      language: 'typescript',
      description: 'Add to your main.ts or App.vue',
      code: `import { createApp } from 'vue'
import { init, track } from 'better-analytics'
import App from './App.vue'

// Initialize Better Analytics
init({
  endpoint: '${apiEndpoint}',
  site: '${siteKey}'
})

const app = createApp(App)

// Global method for tracking
app.config.globalProperties.$track = track

// Track page view on mount
app.mixin({
  mounted() {
    // Track page views for components that represent pages
    if (this.$route) {
      track('pageview', {
        path: this.$route.path,
        name: this.$route.name
      })
    }
  }
})

app.mount('#app')

// In your components:
// this.$track('button_click', { component: 'Header' })`
    },

    'Node.js': {
      title: 'Node.js Server',
      language: 'typescript',
      description: 'Server-side tracking for API endpoints',
      code: `import { track } from 'better-analytics'

// Initialize in your server startup
import { init } from 'better-analytics'

init({
  endpoint: '${apiEndpoint}',
  site: '${siteKey}'
})

// Track API usage
app.post('/api/users', async (req, res) => {
  try {
    // Your API logic here
    const user = await createUser(req.body)
    
    // Track the event
    track('user_created', {
      userId: user.id,
      plan: user.plan,
      source: req.headers.referer
    })
    
    res.json(user)
  } catch (error) {
    track('user_creation_failed', {
      error: error.message,
      body: req.body
    })
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Track page renders (SSR)
app.get('*', (req, res) => {
  track('page_render', {
    path: req.path,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  })
  
  // Your SSR logic
})`
    },

    'cURL': {
      title: 'cURL Testing',
      language: 'bash',
      description: 'Test your analytics endpoint directly',
      code: `# Test a simple pageview event
curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "pageview",
    "timestamp": '$(date +%s000)',
    "site": "${siteKey}",
    "url": "${baseUrl}/test-page",
    "referrer": "",
    "props": {
      "test": true,
      "source": "curl"
    }
  }'

# Test a custom event
curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "button_click",
    "timestamp": '$(date +%s000)',
    "site": "${siteKey}",
    "url": "${baseUrl}/landing",
    "referrer": "",
    "props": {
      "button": "hero-cta",
      "section": "above-fold",
      "test": true
    }
  }'

# Expected response: 200 OK`
    }
  }
}

/**
 * Get environment variables for code examples
 */
export function getExampleEnvironment(siteKey: string, apiEndpoint: string) {
  return {
    'Next.js': `# .env.local
NEXT_PUBLIC_BA_URL=${apiEndpoint}
NEXT_PUBLIC_BA_SITE=${siteKey}`,

    'Environment': `# Environment Variables
BA_ENDPOINT=${apiEndpoint}
BA_SITE_KEY=${siteKey}
BA_DEBUG=true`
  }
} 