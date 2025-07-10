import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

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
        <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
          <span className="text-black font-bold text-sm">BA</span>
        </div>
        Better Analytics
      </>
    ),
  },
  githubUrl: "https://github.com/decker-dev/better-analytics",
};
