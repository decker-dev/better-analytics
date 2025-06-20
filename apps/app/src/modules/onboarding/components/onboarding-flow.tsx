"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";
import { CodeTabs } from "@repo/ui/components/animate-ui/components/code-tabs";
import Link from "next/link";
import { getCodeExamples } from "../lib/code-examples";
import type { Site } from "@/lib/db/schema";
import SecretInput from "./secret-input";

interface OnboardingFlowProps {
  site: Site;
  orgSlug: string;
}

export function OnboardingFlow({ site, orgSlug }: OnboardingFlowProps) {
  const codeExamples = getCodeExamples(site.siteKey);

  return (
    <div className="text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Get started with Better Analytics
              </h1>
              <p className="text-gray-400">
                Follow these steps to set up analytics for your site
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Steps Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-700" />

          {/* Step 1: Site Created */}
          <div className="relative mb-12">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center" />
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-6 max-w-3xl">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Add the site key to your project
                  </h2>
                  <p className="text-gray-300 mb-6 text-base">
                    Add the site key to your project to start collecting data
                  </p>

                  {/* Site Info */}
                  <div className="space-y-4">
                    {/* Site Key */}
                    <SecretInput
                      label="Site Key"
                      placeholder="Enter your site key"
                      value={site.siteKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Install Analytics */}
          <div className="relative">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center" />
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-6 max-w-3xl">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Install Better Analytics
                  </h2>
                  <p className="text-gray-300 mb-6 text-base">
                    Add the analytics code to your website and start collecting
                    data
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

                  {/* Continue Button */}
                  <Link href={`/${orgSlug}/sites/${site.siteKey}/stats`}>
                    <Button className="w-full">
                      Continue to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
