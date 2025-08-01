import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@repo/ui/globals.css";
import { Analytics } from "better-analytics/next";
import { ThemeProvider } from "@/modules/shared/components/theme-provider";
import { QueryProvider } from "@/modules/shared/components/query-provider";
import { env } from "@/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Analytics",
  description: "Analytics for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <Analytics endpoint="/api/collect" mode="production" />
      </body>
    </html>
  );
}
