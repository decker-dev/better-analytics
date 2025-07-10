import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Copy, Terminal, Play, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Better Analytics - Developer Setup",
  description: "Install and test Better Analytics in development mode. See live events in your console before setting up production tracking.",
};

export default function TryInDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Try it in <span className="text-primary">Development</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Install the library and see live events in your console. No signup required to test locally.
          </p>
        </div>

        {/* Installation Steps */}
        <div className="space-y-8">
          {/* Step 1: Install */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                Install Better Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Terminal</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-foreground">
                  <span className="text-primary">pnpm</span> add better-analytics
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Initialize */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                Initialize in Development Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">app/layout.tsx</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-foreground space-y-1">
                  <div><span className="text-blue-400">import</span> {"{ Analytics }"} <span className="text-blue-400">from</span> <span className="text-green-400">'better-analytics/next'</span></div>
                  <div />
                  <div><span className="text-blue-400">export default function</span> <span className="text-yellow-400">RootLayout</span>({"{ children }"}) {"{"}</div>
                  <div className="ml-2"><span className="text-blue-400">return</span> (</div>
                  <div className="ml-4">{"<html lang=\"en\">"}</div>
                  <div className="ml-6">{"<body>"}</div>
                  <div className="ml-8">{"<Analytics site=\"dev-test\" debug={true} />"}</div>
                  <div className="ml-8">{"{children}"}</div>
                  <div className="ml-6">{"</body>"}</div>
                  <div className="ml-4">{"</html>"}</div>
                  <div className="ml-2">)</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Test Events */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                Track Custom Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">components/button.tsx</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-foreground space-y-1">
                  <div><span className="text-blue-400">import</span> {"{ track }"} <span className="text-blue-400">from</span> <span className="text-green-400">'better-analytics'</span></div>
                  <div />
                  <div><span className="text-blue-400">const</span> <span className="text-yellow-400">handleClick</span> = () => {"{"}</div>
                  <div className="ml-2"><span className="text-yellow-400">track</span>(<span className="text-green-400">'button_click'</span>, {"{"}</div>
                  <div className="ml-4">button: <span className="text-green-400">'hero-cta'</span>,</div>
                  <div className="ml-4">page: <span className="text-green-400">'homepage'</span></div>
                  <div className="ml-2">{"})"}</div>
                  <div>{"}"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: See Results */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  4
                </div>
                Open Developer Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Press <kbd className="bg-muted px-2 py-1 rounded text-xs">F12</kbd> or <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+Option+I</kbd> to open DevTools and see your events logged in real-time.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Console Output</span>
                  </div>
                  <div className="text-foreground space-y-1">
                    <div><span className="text-primary">🚀</span> Better Analytics initialized in development mode</div>
                    <div><span className="text-blue-400">📊</span> Event tracked: button_click</div>
                    <div><span className="text-green-400">✓</span> Event logged to console (not sent to server)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">Ready to capture events in production?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Create your free account to get a site key and start tracking real users. 
              No credit card required, unlimited events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-in">
                <Button size="lg" className="w-full sm:w-auto">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://docs.better-analytics.app/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Development Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Events are logged to console, not sent to server. Perfect for testing and debugging.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Zero Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lightweight SDK under 3KB gzipped. No external dependencies or tracking pixels.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No cookies, no personal data collection. GDPR compliant by design.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 