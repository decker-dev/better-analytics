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
import { CodeEditor } from "@repo/ui/components/animate-ui/components/code-editor";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <CodeEditor
        cursor
        className="w-[640px] h-[340px] bg-gray-900 border border-gray-700"
        lang="tsx"
        title="component.tsx"
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
    </div>
  );
}
