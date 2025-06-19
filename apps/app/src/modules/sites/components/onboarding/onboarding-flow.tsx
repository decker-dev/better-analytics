"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Circle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { CodeTabs } from "@repo/ui/components/animate-ui/components/code-tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCodeExamples } from "../../lib/code-examples";
import { useOnboardingEvents } from "../../hooks/use-live-events";
import type { Site } from "@/lib/db/schema";

interface OnboardingFlowProps {
  site: Site;
  orgSlug: string;
  apiEndpoint: string;
}

export function OnboardingFlow({
  site,
  orgSlug,
  apiEndpoint,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [showSiteKey, setShowSiteKey] = useState(false);
  const [step2Complete, setStep2Complete] = useState(false);

  // Live events polling
  const {
    events,
    hasFirstEvent,
    isLoading: eventsLoading,
  } = useOnboardingEvents(site.siteKey);

  const codeExamples = getCodeExamples(site.siteKey, apiEndpoint);

  const handleCopySiteKey = async () => {
    try {
      await navigator.clipboard.writeText(site.siteKey);
      // TODO: Add toast notification
    } catch (error) {
      console.error("Failed to copy site key:", error);
    }
  };

  // Removed handleRenameSite function

  const handleSendTestEvent = async () => {
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "test_event",
          timestamp: Date.now(),
          site: site.siteKey,
          url: window.location.href,
          referrer: "",
          props: {
            source: "onboarding",
            test: true,
          },
        }),
      });

      if (response.ok) {
        setStep2Complete(true);
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error("Failed to send test event:", error);
    }
  };

  const handleContinueToDashboard = () => {
    router.push(`/${orgSlug}/sites/${site.siteKey}/stats`);
  };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Get started with Better Analytics
              </h1>
              <p className="text-gray-400">
                Follow these steps to set up analytics for your site
              </p>
            </div>
            <Link href={`/${orgSlug}/sites`}>
              <Button variant="outline">Skip Setup</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Steps Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-700" />

          {/* Step 1: Site Created */}
          <div className="relative mb-12">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-6 max-w-3xl">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Site Created Successfully
                  </h2>
                  <p className="text-gray-300 mb-6 text-base">
                    Your site is ready to collect analytics data
                  </p>

                  {/* Site Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Site Name:</span>
                      <span className="font-mono">{site.name}</span>
                    </div>

                    {/* Site Key */}
                    <div className="bg-gray-800/80 rounded-md p-4 flex items-center justify-between font-mono text-sm">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">
                          Site Key
                        </div>
                        <span className="text-gray-300 tracking-wider">
                          {showSiteKey
                            ? site.siteKey
                            : "•".repeat(site.siteKey.length)}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSiteKey(!showSiteKey)}
                        >
                          {showSiteKey ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCopySiteKey}
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Install Analytics */}
          <div className="relative mb-12">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step2Complete || hasFirstEvent
                      ? "bg-green-500"
                      : "border-2 border-blue-500 bg-blue-500"
                  }`}
                >
                  {step2Complete || hasFirstEvent ? (
                    <CheckCircle className="w-5 h-5 text-black" />
                  ) : (
                    <span className="text-sm font-medium text-white">2</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div
                  className={`border rounded-lg p-6 max-w-3xl ${
                    step2Complete || hasFirstEvent
                      ? "bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30"
                      : "bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/30"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Install Better Analytics
                  </h2>
                  <p className="text-gray-300 mb-6 text-base">
                    Add the analytics code to your website
                  </p>

                  {/* Code Examples */}
                  <div className="mb-6">
                    <CodeTabs
                      codes={Object.fromEntries(
                        Object.entries(codeExamples).map(([key, value]) => [
                          key,
                          value.code,
                        ]),
                      )}
                      lang="typescript"
                      copyButton={true}
                      className="max-w-3xl"
                    />
                  </div>

                  {/* Test Button */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSendTestEvent}
                      disabled={hasFirstEvent}
                    >
                      {hasFirstEvent ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Test Event Sent
                        </>
                      ) : (
                        "Send Test Event"
                      )}
                    </Button>
                    <div className="text-sm text-gray-400 flex items-center">
                      Or implement the code above and visit your site
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: First Event */}
          <div className="relative">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    hasFirstEvent
                      ? "bg-green-500"
                      : "border-2 border-gray-600 bg-gray-800"
                  }`}
                >
                  {hasFirstEvent ? (
                    <CheckCircle className="w-5 h-5 text-black" />
                  ) : eventsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                  ) : (
                    <span className="text-sm font-medium text-gray-300">3</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div
                  className={`border rounded-lg p-6 max-w-3xl ${
                    hasFirstEvent
                      ? "bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30"
                      : "bg-gray-900/50 border-gray-700"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-white mb-3">
                    {hasFirstEvent
                      ? "First Event Received!"
                      : "Waiting for your first event..."}
                  </h2>
                  <p className="text-gray-300 mb-6 text-base">
                    {hasFirstEvent
                      ? "Great! Your analytics are working perfectly."
                      : "We'll automatically detect when your first event arrives"}
                  </p>

                  {/* Live Events Display */}
                  <div className="bg-gray-800/80 rounded-md p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">
                        Live Events
                      </span>
                      {eventsLoading && !hasFirstEvent && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Listening...
                        </div>
                      )}
                    </div>

                    {hasFirstEvent ? (
                      <div className="space-y-2">
                        {events.map((event, index) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                              <span className="text-white font-mono">
                                {event.event}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events yet</p>
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  {hasFirstEvent && (
                    <Button
                      onClick={handleContinueToDashboard}
                      className="w-full"
                    >
                      Continue to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
