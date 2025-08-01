"use client";

import { type UseInViewOptions, useInView } from "motion/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { CopyButton } from "@repo/ui/components/animate-ui/buttons/copy";
import { cn } from "@repo/ui/lib/utils";

type CodeEditorProps = Omit<React.ComponentProps<"div">, "onCopy"> & {
  children: string;
  lang: string;
  themes?: {
    light: string;
    dark: string;
  };
  duration?: number;
  delay?: number;
  header?: boolean;
  dots?: boolean;
  icon?: React.ReactNode;
  cursor?: boolean;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
  copyButton?: boolean;
  writing?: boolean;
  title?: string;
  onDone?: () => void;
  onCopy?: (content: string) => void;
};

function CodeEditor({
  children: code,
  lang,
  themes = {
    light: "dark-plus",
    dark: "dark-plus",
  },
  duration = 5,
  delay = 0,
  className,
  header = true,
  dots = true,
  icon,
  cursor = false,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  copyButton = false,
  writing = true,
  title,
  onDone,
  onCopy,
  ...props
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const editorRef = React.useRef<HTMLDivElement>(null);
  const [visibleCode, setVisibleCode] = React.useState("");
  const [highlightedCode, setHighlightedCode] = React.useState("");
  const [isDone, setIsDone] = React.useState(false);

  const inViewResult = useInView(editorRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  React.useEffect(() => {
    if (!visibleCode.length || !isInView) return;

    const loadHighlightedCode = async () => {
      try {
        const { codeToHtml } = await import("shiki");

        const highlighted = await codeToHtml(visibleCode, {
          lang,
          themes: {
            light: themes.light,
            dark: themes.dark,
          },
          defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        });

        setHighlightedCode(highlighted);
      } catch (e) {
        console.error(`Language "${lang}" could not be loaded.`, e);
      }
    };

    loadHighlightedCode();
  }, [
    lang,
    themes,
    writing,
    isInView,
    duration,
    delay,
    visibleCode,
    resolvedTheme,
  ]);

  React.useEffect(() => {
    if (!writing) {
      setVisibleCode(code);
      onDone?.();
      return;
    }

    if (!code.length || !isInView) return;

    let index = 0;
    const totalDuration = duration * 1000;
    const interval = totalDuration / code.length;
    let intervalId: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < code.length) {
          index += 1;
          setVisibleCode(code.slice(0, index));
          editorRef.current?.scrollTo({
            top: editorRef.current?.scrollHeight,
            behavior: "smooth",
          });
        } else {
          clearInterval(intervalId);
          setIsDone(true);
          onDone?.();
        }
      }, interval);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalId);
    };
  }, [code, duration, delay, isInView, writing, onDone]);

  return (
    <div
      data-slot="code-editor"
      className={cn(
        "relative bg-black w-[600px] h-[400px] border border-gray-800 overflow-hidden flex flex-col rounded-xl text-white",
        className,
      )}
      {...props}
    >
      {header ? (
        <div className="bg-gray-950 border-b border-gray-800 relative flex flex-row items-center justify-between gap-y-2 h-10 px-4">
          {dots && (
            <div className="flex flex-row gap-x-2">
              <div className="size-2 rounded-full bg-red-500" />
              <div className="size-2 rounded-full bg-yellow-500" />
              <div className="size-2 rounded-full bg-green-500" />
            </div>
          )}

          {title && (
            <div
              className={cn(
                "flex flex-row items-center gap-2",
                dots &&
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              )}
            >
              {icon ? (
                <div
                  className="text-gray-400 [&_svg]:size-3.5"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  // biome-ignore lint/security/noDangerouslySetInnerHtmlWithChildren: <explanation>
                  dangerouslySetInnerHTML={
                    typeof icon === "string" ? { __html: icon } : undefined
                  }
                >
                  {typeof icon !== "string" ? icon : null}
                </div>
              ) : null}
              <figcaption className="flex-1 truncate text-gray-400 text-[13px]">
                {title}
              </figcaption>
            </div>
          )}

          {copyButton ? (
            <CopyButton
              content={code}
              size="sm"
              variant="ghost"
              className="-me-2 bg-transparent hover:bg-white/10 text-gray-300"
              onCopy={onCopy}
            />
          ) : null}
        </div>
      ) : (
        copyButton && (
          <CopyButton
            content={code}
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 z-[2] backdrop-blur-md bg-transparent hover:bg-white/10 text-gray-300"
            onCopy={onCopy}
          />
        )
      )}
      <div
        ref={editorRef}
        className="h-[calc(100%-2.75rem)] w-full text-sm p-4 font-mono relative overflow-auto flex-1 bg-black text-gray-100"
      >
        <div
          className={cn(
            "[&_*]:!bg-transparent [&_pre]:!bg-transparent [&_code]:!bg-transparent",
            "[&_.shiki]:!bg-transparent [&_.shiki_pre]:!bg-transparent",
            "[&_code]:!text-[13px] [&>pre]:text-gray-100 [&>pre,_&_code]:border-none",
            cursor &&
              !isDone &&
              "[&_.line:last-child::after]:content-['|'] [&_.line:last-child::after]:animate-pulse [&_.line:last-child::after]:text-gray-100",
          )}
        >
          {highlightedCode ? (
            <div
              className="[&_*]:!bg-transparent [&_pre]:!bg-transparent [&_code]:!bg-transparent"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <pre className="text-gray-100 whitespace-pre-wrap font-mono text-[13px] leading-relaxed bg-transparent">
              {visibleCode}
              {cursor && !isDone && <span className="animate-pulse">|</span>}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export { CodeEditor, type CodeEditorProps };
