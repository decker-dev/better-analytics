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
    <div className="min-h-screen bg-black text-white">
      <CodeEditor
        cursor
        className="w-[640px] h-[480px]"
        lang="tsx"
        title="component.tsx"
        icon={<Code />}
        duration={15}
        delay={0.5}
        copyButton
      >
        {`'use client';
 
import * as React from 'react';
 
type MyComponentProps = {
  myProps: string;
} & React.HTMLAttributes<HTMLDivElement>;
 
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ myProps, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <p>My Component</p>
      </div>
    );
  },
);
MyComponent.displayName = 'MyComponent';
 
export { MyComponent, type MyComponentProps };`}
      </CodeEditor>
    </div>
  );
}
