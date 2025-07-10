import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image
          alt="Better Analytics"
          src="/logo.svg"
          width={24}
          height={24}
          className="h-6 w-6"
        />
        <span className="font-medium">Better Analytics</span>
      </>
    ),
  },
  githubUrl: "https://github.com/decker-dev/better-analytics",
};
