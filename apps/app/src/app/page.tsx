import { Card, CardContent } from "@repo/ui/components/card";
import Link from "next/link";
import { Badge } from "@repo/ui/components/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                BA
              </span>
            </div>
            <span className="font-semibold">Better Analytics</span>
          </div>
          <Link href="/sign-in">
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Lightweight • Privacy-First • Developer-Friendly
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Analytics that <span className="text-primary">actually work</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A micro-analytics SDK for modern web apps. Under 2KB,
            framework-agnostic, with rich insights and privacy-first design. Get
            started in 3 lines of code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/sign-in">
              <button
                type="button"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg w-full sm:w-auto"
              >
                Start Tracking Now
              </button>
            </Link>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span className="text-sm">
                Free to start • No credit card required
              </span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Under 2KB gzipped. Tree-shakable, modern ESM/CJS dual package
                with TypeScript support.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold">Privacy-First</h3>
              <p className="text-muted-foreground">
                GDPR-friendly with lightweight fingerprinting. No cookies, no
                personal data collection.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-2xl">⚛️</span>
              </div>
              <h3 className="text-xl font-semibold">Framework Ready</h3>
              <p className="text-muted-foreground">
                Works with any JavaScript project. Built-in React/Next.js
                components with automatic tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold">Rich Insights</h3>
              <p className="text-muted-foreground">
                Automatic session tracking, device fingerprinting, UTM
                parameters, and performance metrics.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold">Dead Simple</h3>
              <p className="text-muted-foreground">
                Three lines to get started. Add {"<Analytics />"} component and
                start tracking immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold">Self-Hosted Option</h3>
              <p className="text-muted-foreground">
                Use our SaaS or host your own. Full control over your data with
                flexible deployment options.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Code Example */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-8">Get started in seconds</h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="text-left">
                <div className="text-sm text-muted-foreground mb-2">
                  1. Install the package
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm mb-4">
                  npm install better-analytics
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  2. Add to your app
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm space-y-1">
                  <div className="text-blue-600 dark:text-blue-400">import</div>
                  <div>
                    {" { Analytics } "}
                    <span className="text-blue-600 dark:text-blue-400">
                      from
                    </span>
                    {' "better-analytics/next";'}
                  </div>
                  <div className="mt-2">{'<Analytics site="my-app" />'}</div>
                </div>

                <div className="text-sm text-muted-foreground mb-2 mt-4">
                  3. Track events
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div>{"track('signup_clicked');"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              Ready to get better analytics?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join developers who chose Better Analytics for fast,
              privacy-friendly, and developer-focused web analytics.
            </p>
            <Link href="/sign-in">
              <button
                type="button"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
              >
                Start Your Free Account
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>
              &copy; 2024 Better Analytics. Built for developers, by developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
