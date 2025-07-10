"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { RefreshCw, Clock, Activity, Copy, CheckCircle } from "lucide-react";
import { codeToHtml } from "shiki";
import Link from "next/link";

interface TempSiteEvent {
  id: string;
  evt: string;
  url: string | null;
  props: string | null;
  ts: string;
  createdAt: Date | null;
}

interface TempSite {
  id: string;
  siteKey: string;
  createdAt: number;
  expiresAt: number;
  events: TempSiteEvent[];
  timeRemaining: number;
}

interface TempSiteDemoProps {
  tempSite: TempSite;
  tempId: string;
}

// Custom hook for fetching temp site data with polling
function useTempSiteData(tempId: string, initialData: TempSite) {
  return useQuery({
    queryKey: ["tempSite", tempId],
    queryFn: async () => {
      const response = await fetch(`/api/temp-sites/${tempId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch temp site data");
      }
      const result = await response.json();
      return result.data;
    },
    initialData,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
    staleTime: 0, // Always consider data stale to ensure fresh polling
  });
}

function formatTimeRemaining(timeRemaining: number): string {
  const minutes = Math.floor(timeRemaining / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="flex items-center gap-2"
    >
      {copied ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? "Copied!" : `Copy ${label}`}
    </Button>
  );
}

export function TempSiteDemo({
  tempSite: initialTempSite,
  tempId,
}: TempSiteDemoProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    initialTempSite.timeRemaining,
  );
  const router = useRouter();

  // Use React Query for automatic polling
  const {
    data: tempSite,
    isLoading,
    error,
    refetch,
  } = useTempSiteData(tempId, initialTempSite);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        return newTime > 0 ? newTime : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function (now using React Query's refetch)
  const refreshEvents = () => {
    refetch();
  };

  const setupCode = `import { Analytics } from 'better-analytics/next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Analytics site="${tempSite.siteKey}" endpoint="/api/collect" />
        {children}
      </body>
    </html>
  )
}`;

  const trackingCode = `import { track } from 'better-analytics'

// Track button clicks
const handleClick = () => {
  track('button_click', {
    button: 'hero-cta',
    page: 'homepage'
  })
}

// Track page views automatically
// (handled by Analytics component)`;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold">
              Live Analytics Demo
            </h1>
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-400 border-green-500/20"
            >
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <Clock className="h-4 w-4" />
            <span>Expires in: {formatTimeRemaining(timeRemaining)}</span>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your temporary analytics site is ready. Use the code below to start
            tracking events. This demo expires in 1 hour.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Instructions */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Setup Code
                  <CopyButton text={setupCode} label="Setup" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground">
                    <code>{setupCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Track Events
                  <CopyButton text={trackingCode} label="Code" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground">
                    <code>{trackingCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Site Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Site Key:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {tempSite.siteKey}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    /api/collect
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Events */}
          <div>
            <Card className="bg-card border-border h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Events ({tempSite.events.length})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshEvents}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    {isLoading ? "Loading..." : "Refresh"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-center py-4 text-red-400">
                    <p>Error loading events. Retrying...</p>
                  </div>
                )}
                {tempSite.events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>
                      No events yet. Start tracking to see events appear here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tempSite.events
                      .slice()
                      .reverse()
                      .map((event: TempSiteEvent, index: number) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={index}
                          className="bg-muted/30 rounded-lg p-3 border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-primary">
                              {event.evt}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.ts).toLocaleTimeString()}
                            </span>
                          </div>
                          {event.url && (
                            <div className="text-sm text-muted-foreground mb-1">
                              URL: {event.url}
                            </div>
                          )}
                          {event.props && (
                            <div className="text-sm text-muted-foreground">
                              <code className="bg-muted/50 px-2 py-1 rounded text-xs">
                                {typeof event.props === "string"
                                  ? event.props
                                  : JSON.stringify(
                                      JSON.parse(event.props || "{}"),
                                      null,
                                      2,
                                    )}
                              </code>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Create a permanent account to keep your analytics data and access
            advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Create Account
              </Button>
            </Link>
            <Link href="/start">
              <Button variant="outline" size="lg">
                Back to Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
