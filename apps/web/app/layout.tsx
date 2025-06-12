import { Geist, Geist_Mono } from "next/font/google";

import "@repo/ui/globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "better-analytics/next";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased dark:bg-background dark:text-foreground`}
      >
        <Providers>{children}</Providers>
        <Analytics api="/api/collect" />
      </body>
    </html>
  );
}
