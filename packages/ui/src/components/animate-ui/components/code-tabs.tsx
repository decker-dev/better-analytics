"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import { CopyButton } from "@repo/ui/components/animate-ui/buttons/copy";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  type TabsProps,
  TabsTrigger,
} from "@repo/ui/components/animate-ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";

type CodeTabsProps = {
  codes: Record<string, string | { display: string; copy: string }>;
  lang?: string;
  themes?: {
    light: string;
    dark: string;
  };
  copyButton?: boolean;
  onCopy?: (content: string) => void;
} & Omit<TabsProps, "children">;

function CodeTabs({
  codes,
  lang = "bash",
  themes = {
    light: "dark-plus",
    dark: "dark-plus",
  },
  className,
  defaultValue,
  value,
  onValueChange,
  copyButton = true,
  onCopy,
  ...props
}: CodeTabsProps) {
  const { resolvedTheme } = useTheme();

  const [highlightedCodes, setHighlightedCodes] = React.useState<Record<
    string,
    string
  > | null>(null);
  const [selectedCode, setSelectedCode] = React.useState<string>(
    value ?? defaultValue ?? Object.keys(codes)[0] ?? "",
  );

  // Normalize codes to support both string and object formats
  const normalizedCodes = React.useMemo(() => {
    const result: Record<string, { display: string; copy: string }> = {};
    for (const [key, val] of Object.entries(codes)) {
      if (typeof val === "string") {
        result[key] = { display: val, copy: val };
      } else {
        result[key] = val;
      }
    }
    return result;
  }, [codes]);

  React.useEffect(() => {
    async function loadHighlightedCode() {
      try {
        const { codeToHtml } = await import("shiki");
        const newHighlightedCodes: Record<string, string> = {};

        for (const [command, val] of Object.entries(normalizedCodes)) {
          const highlighted = await codeToHtml(val.display, {
            lang,
            themes: {
              light: themes.light,
              dark: themes.dark,
            },
            defaultColor: resolvedTheme === "dark" ? "dark" : "light",
          });

          newHighlightedCodes[command] = highlighted;
        }

        setHighlightedCodes(newHighlightedCodes);
      } catch (error) {
        console.error("Error highlighting codes", error);
        // Fallback to display codes
        const fallbackCodes: Record<string, string> = {};
        for (const [key, val] of Object.entries(normalizedCodes)) {
          fallbackCodes[key] = val.display;
        }
        setHighlightedCodes(fallbackCodes);
      }
    }
    loadHighlightedCode();
  }, [resolvedTheme, lang, themes.light, themes.dark, normalizedCodes]);

  return (
    <Tabs
      data-slot="install-tabs"
      className={cn(
        "w-full gap-0 bg-background rounded-xl border dark:border-white/20 overflow-hidden",
        className,
      )}
      {...props}
      value={selectedCode}
      onValueChange={(val) => {
        setSelectedCode(val);
        onValueChange?.(val);
      }}
    >
      <TabsList
        data-slot="install-tabs-list"
        className="w-full relative justify-between rounded-none h-10 bg-gray-950 border-b border-border/75 dark:border-white/20 text-current py-0 px-4 flex-shrink-0"
        activeClassName="rounded-none shadow-none bg-transparent after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0 dark:after:bg-white after:bg-black after:rounded-t-full"
      >
        <div className="flex gap-x-3 h-full">
          {highlightedCodes &&
            Object.keys(highlightedCodes).map((code) => (
              <TabsTrigger
                key={code}
                value={code}
                className="text-muted-foreground data-[state=active]:text-current px-0"
              >
                {code}
              </TabsTrigger>
            ))}
        </div>

        {copyButton && highlightedCodes && (
          <CopyButton
            content={normalizedCodes[selectedCode]?.copy || ""}
            size="sm"
            variant="ghost"
            className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
            onCopy={onCopy}
          />
        )}
      </TabsList>
      <TabsContents data-slot="install-tabs-contents" className="flex-1">
        {highlightedCodes &&
          Object.entries(highlightedCodes).map(([code, val]) => (
            <TabsContent
              data-slot="install-tabs-content"
              key={code}
              className="w-full text-sm"
              value={code}
            >
              <div className="w-full max-h-96 overflow-auto p-4">
                <div
                  className="[&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0 [&>pre]:!border-none [&>pre]:!outline-none [&_code]:!bg-transparent [&_code]:!m-0 [&_code]:!p-0 [&_code]:!border-none [&_code]:!outline-none [&>pre,_&_code]:[background:transparent_!important] [&_code]:!text-[13px] [&>pre]:!whitespace-pre-wrap [&_code]:!whitespace-pre-wrap [&>pre]:!word-break-break-word [&_code]:!word-break-break-word"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{ __html: val }}
                />
              </div>
            </TabsContent>
          ))}
      </TabsContents>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
