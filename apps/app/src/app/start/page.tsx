import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Terminal } from "lucide-react";
import type { Metadata } from "next";
import { codeToHtml } from "shiki";

export const metadata: Metadata = {
  title: "Try Better Analytics - Developer Setup",
  description:
    "Install and test Better Analytics in development mode. See live events in your console before setting up production tracking.",
};

async function generateCodeBlock(
  code: string,
  language: string,
  title: string,
) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: "dark-plus",
  });

  return (
    <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
      <div
        className="text-foreground [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent [&_code]:!text-[13px]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default async function StartPage() {
  const installCode = await generateCodeBlock(
    "pnpm add better-analytics",
    "bash",
    "Terminal",
  );

  const layoutCode = await generateCodeBlock(
    `import { Analytics } from 'better-analytics/next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Analytics site="dev-test" debug={true} />
        {children}
      </body>
    </html>
  )
}`,
    "tsx",
    "app/layout.tsx",
  );

  const trackingCode = await generateCodeBlock(
    `import { track } from 'better-analytics'

const handleClick = () => {
  track('button_click', {
    button: 'hero-cta',
    page: 'homepage'
  })
}`,
    "tsx",
    "components/button.tsx",
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Start tracking events in your app
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Install the library and see live events in your console.
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
            <CardContent>{installCode}</CardContent>
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
            <CardContent>{layoutCode}</CardContent>
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
            <CardContent>{trackingCode}</CardContent>
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
                  Press{" "}
                  <kbd className="bg-muted px-2 py-1 rounded text-xs">F12</kbd>{" "}
                  or{" "}
                  <kbd className="bg-muted px-2 py-1 rounded text-xs">
                    Cmd+Option+I
                  </kbd>{" "}
                  to open DevTools and see your events logged in real-time.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Console Output
                    </span>
                  </div>
                  <div className="text-foreground space-y-1">
                    <div>
                      <span className="text-primary">🚀</span> Better Analytics
                      initialized in development mode
                    </div>
                    <div>
                      <span className="text-blue-400">📊</span> Event tracked:
                      button_click
                    </div>
                    <div>
                      <span className="text-green-400">✓</span> Event logged to
                      console (not sent to server)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
