import { Zap, Heart, Code } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { CodeEditor } from "@repo/ui/components/animate-ui/components/code-editor";
import { CodeTabs } from "@repo/ui/components/animate-ui/components/code-tabs";

const COMMANDS = {
  pnpm: "pnpm add better-analytics",
  yarn: "yarn add better-analytics",
  bun: "bun add better-analytics",
  npm: "npm install better-analytics",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Content Section */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-gray-400 text-sm">
                  Own Your Analytics
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                The fastest way to add analytics to your app.
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Drop-in replacement for Vercel Analytics. Same API, your
                endpoint. Open source, privacy-first, and lightning fast.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
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
            </div>

            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-[500px] flex flex-col gap-4">
                <CodeEditor
                  cursor
                  className="w-full h-[280px] sm:h-[320px] lg:h-[340px] bg-black border border-white/30"
                  lang="tsx"
                  title="layout.tsx"
                  icon={<Code />}
                  duration={10}
                  delay={0.5}
                  copyButton
                >
                  {`import { Analytics } from "better-analytics/next";

export default function Layout() {
  return (
    <html>
      <body>
        {children}
        <Analytics api="/api/collect" />
      </body>
    </html>
  );
}`}
                </CodeEditor>
                <CodeTabs
                  defaultValue="pnpm"
                  className="max-w-[650px] bg-black"
                  codes={COMMANDS}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
