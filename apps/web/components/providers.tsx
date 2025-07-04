"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  );
}
