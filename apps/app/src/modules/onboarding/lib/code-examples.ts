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
export function getCodeExamples(siteKey: string): Record<string, CodeExample> {
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
        <Analytics site="${siteKey}" />
        {children}
      </body>
    </html>
  )
}`},
    'React': {
      title: 'React Component',
      language: 'typescript',
      description: 'Add to your main App component',
      code: `import { useEffect } from 'react'
import { init, trackPageview, track } from 'better-analytics'

function App() {
  useEffect(() => {
    // Initialize Better Analytics
    init({
      site: '${siteKey}'
    })
    
    // Track initial page view
    trackPageview()
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
      code: `import { init, trackPageview, track } from 'better-analytics'

// Initialize Better Analytics
init({
  site: '${siteKey}'
})

// Track page view
trackPageview()

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
    import { init, trackPageview, track } from './path/to/better-analytics.js'
    
    // Initialize
    init({
      site: '${siteKey}'
    })
    
    // Track page view
    trackPageview()
    
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
  }
}

/**
 * Get example environment variables for Better Analytics
 */
export function getExampleEnvironment(siteKey: string, apiEndpoint: string) {
  return {
    'NEXT_PUBLIC_BA_SITE': siteKey,
  };
} 