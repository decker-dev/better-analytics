"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Eye, EyeOff, Copy, MessageSquare } from "lucide-react";

export default function Onboarding() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState("Node.js");

  const tabs = [
    "Node.js",
    "Ruby",
    "PHP",
    "Python",
    "Go",
    "Rust",
    "Java",
    "Elixir",
    "cURL",
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Title Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Send your first email
          </h1>
          <p className="text-gray-400 text-lg">
            Follow the steps to send an email using the Resend API.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-700" />

          {/* Step 1: Add API Key */}
          <div className="relative mb-12">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xl font-semibold text-white">
                      Add an API Key
                    </h2>
                    <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                      <span className="text-xs text-gray-400">?</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 text-base">
                    Use the following generated key to authenticate requests
                  </p>

                  {/* API Key Input */}
                  <div className="bg-gray-800/80 rounded-md p-4 flex items-center justify-between font-mono text-sm">
                    <span className="text-gray-300 tracking-wider">
                      {showApiKey
                        ? "re_123abc456def789ghi012jkl345mno678pqr"
                        : "•".repeat(44)}
                    </span>
                    <div className="flex gap-2 ml-4">
                      <Button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Send Email */}
          <div className="relative">
            <div className="flex items-start gap-8">
              {/* Step Indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">2</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 -mt-1">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Send an email
                  </h2>
                  <p className="text-gray-400 text-base">
                    Implement or run the code below to send your first email
                  </p>
                </div>

                {/* Code Editor */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  {/* Tabs */}
                  <div className="flex items-center justify-between bg-gray-800/50 border-b border-gray-700 px-4 py-2">
                    <div className="flex">
                      {tabs.map((tab) => (
                        <Button
                          type="button"
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                            activeTab === tab
                              ? "bg-gray-700 text-white"
                              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                          }`}
                        >
                          {tab}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>

                  {/* Code Content */}
                  <div className="p-6 font-mono text-sm leading-relaxed">
                    <div className="text-gray-300">
                      <div className="mb-4">
                        <span className="text-purple-400">import</span>{" "}
                        <span className="text-yellow-300">{"{"}</span>{" "}
                        <span className="text-blue-300">Resend</span>{" "}
                        <span className="text-yellow-300">{"}"}</span>{" "}
                        <span className="text-purple-400">from</span>{" "}
                        <span className="text-green-300">'resend'</span>
                        <span className="text-gray-500">;</span>
                      </div>

                      <div className="mb-4">
                        <span className="text-purple-400">const</span>{" "}
                        <span className="text-blue-300">resend</span>{" "}
                        <span className="text-white">=</span>{" "}
                        <span className="text-purple-400">new</span>{" "}
                        <span className="text-yellow-300">Resend</span>
                        <span className="text-white">(</span>
                        <span className="text-green-300">'•'.repeat(36)</span>
                        <span className="text-white">)</span>
                        <span className="text-gray-500">;</span>
                      </div>

                      <div>
                        <span className="text-blue-300">resend</span>
                        <span className="text-white">.</span>
                        <span className="text-blue-300">emails</span>
                        <span className="text-white">.</span>
                        <span className="text-yellow-300">send</span>
                        <span className="text-white">(</span>
                        <span className="text-yellow-300">{"{"}</span>
                        <div className="ml-4">
                          <div className="text-blue-300">
                            from<span className="text-white">:</span>{" "}
                            <span className="text-green-300">
                              'onboarding@resend.dev'
                            </span>
                            <span className="text-white">,</span>
                          </div>
                          <div className="text-blue-300">
                            to<span className="text-white">:</span>{" "}
                            <span className="text-green-300">
                              'me@decker.sh'
                            </span>
                            <span className="text-white">,</span>
                          </div>
                          <div className="text-blue-300">
                            subject<span className="text-white">:</span>{" "}
                            <span className="text-green-300">
                              'Hello World'
                            </span>
                            <span className="text-white">,</span>
                          </div>
                          <div className="text-blue-300">
                            html<span className="text-white">:</span>{" "}
                            <span className="text-green-300">
                              '&lt;p&gt;Congrats on sending your
                              &lt;strong&gt;first
                              email&lt;/strong&gt;!&lt;/p&gt;'
                            </span>
                          </div>
                        </div>
                        <span className="text-yellow-300">{"}"}</span>
                        <span className="text-white">)</span>
                        <span className="text-gray-500">;</span>
                      </div>
                    </div>

                    {/* Send Button */}
                    <div className="mt-8">
                      <Button className="bg-white text-black hover:bg-gray-100 font-medium px-4 py-2">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explore More */}
        <div className="mt-20">
          <h3 className="text-xl font-medium text-gray-400">Explore more</h3>
        </div>
      </div>
    </div>
  );
}
