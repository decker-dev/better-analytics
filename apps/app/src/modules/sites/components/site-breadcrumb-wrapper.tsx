"use client";

import { usePathname } from "next/navigation";
import { SiteBreadcrumb } from "./site-breadcrumb";

interface SiteBreadcrumbWrapperProps {
  orgSlug: string;
  orgName: string;
  siteName: string;
  siteKey: string;
}

export const SiteBreadcrumbWrapper = ({
  orgSlug,
  orgName,
  siteName,
  siteKey,
}: SiteBreadcrumbWrapperProps) => {
  const pathname = usePathname();
  const currentPage: "stats" | "settings" = pathname.includes("/settings")
    ? "settings"
    : "stats";

  return (
    <SiteBreadcrumb
      orgSlug={orgSlug}
      orgName={orgName}
      siteName={siteName}
      siteKey={siteKey}
      currentPage={currentPage}
    />
  );
};
