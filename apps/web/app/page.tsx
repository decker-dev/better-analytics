import {
  ArrowRight,
  Copy,
  Check,
  Github,
  Moon,
  BarChart3,
  Zap,
  Heart,
  Code,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-gray-400 text-sm">
                  Own Your Analytics
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                The fastest way to add analytics to your app.
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                Drop-in replacement for Vercel Analytics. Same API, your
                endpoint. Open source, privacy-first, and lightning fast.
              </p>

              <div className="flex items-center space-x-4 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-400 border-green-500/20"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Open Source
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {"< 2KB"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                >
                  Free Forever
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 transition-colors"
                >
                  GET STARTED
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600"
                >
                  <Code className="h-4 w-4 mr-2" />
                  View on GitHub
                </Button>
              </div>

              <div className="mt-8 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>npm add better-analytics</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>3 lines of code</span>
                </div>
              </div>
            </div>

            {/* Right Code Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
              <div className="relative bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">layout.tsx</span>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Code Content */}
                <div className="p-6 font-mono text-sm">
                  <div className="space-y-4">
                    <div className="flex">
                      <span className="text-gray-500 w-8">01</span>
                      <span className="text-blue-400">import</span>
                      <span className="text-white ml-2">{"{ Analytics }"}</span>
                      <span className="text-blue-400 ml-2">from</span>
                      <span className="text-green-400 ml-2">
                        "better-analytics/next"
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">02</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">03</span>
                      <span className="text-blue-400">export</span>
                      <span className="text-blue-400 ml-2">default</span>
                      <span className="text-blue-400 ml-2">function</span>
                      <span className="text-yellow-400 ml-2">Layout</span>
                      <span className="text-white">{"() {"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">04</span>
                      <span className="text-blue-400">return</span>
                      <span className="text-white ml-2">{"("}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">05</span>
                      <span className="text-gray-400 ml-8">{"<html>"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">06</span>
                      <span className="text-gray-400 ml-12">{"<body>"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">07</span>
                      <span className="text-gray-400 ml-16">
                        {"{children}"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">08</span>
                      <span className="text-red-400 ml-16">{"<Analytics"}</span>
                      <span className="text-blue-400 ml-2">api</span>
                      <span className="text-white">=</span>
                      <span className="text-green-400">"/api/collect"</span>
                      <span className="text-red-400 ml-2">{"/>"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">09</span>
                      <span className="text-gray-400 ml-12">{"</body>"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">10</span>
                      <span className="text-gray-400 ml-8">{"</html>"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">11</span>
                      <span className="text-white ml-4">{")"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-8">12</span>
                      <span className="text-white">{"}"}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Button */}
                <div className="px-6 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-gray-800/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Framework Agnostic</h3>
              <p className="text-gray-400 leading-relaxed">
                Works with React, Vue, Svelte, or vanilla JavaScript. One SDK,
                every framework.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Privacy First</h3>
              <p className="text-gray-400 leading-relaxed">
                Your data stays on your servers. No third-party tracking, no
                cookies, no GDPR headaches.
              </p>
            </div>

            <div>
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Open Source</h3>
              <p className="text-gray-400 leading-relaxed">
                MIT licensed. Contribute, fork, or self-host. Built by
                developers, for developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">better-analytics</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="/docs" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="/github" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a
                href="/community"
                className="hover:text-white transition-colors"
              >
                Community
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800/30 text-center text-gray-500 text-sm">
            <p>Built with ❤️ for developers who value simplicity and privacy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
