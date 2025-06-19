"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface SiteBreadcrumbProps {
  orgSlug: string;
  orgName: string;
  siteName: string;
  siteKey: string;
  currentPage: "stats" | "settings";
}

export const SiteBreadcrumb = ({
  orgSlug,
  orgName,
  siteName,
  siteKey,
  currentPage,
}: SiteBreadcrumbProps) => {
  const breadcrumbs = [
    {
      name: orgName,
      href: `/${orgSlug}`,
      icon: Home,
    },
    {
      name: "Sites",
      href: `/${orgSlug}/sites`,
    },
    {
      name: siteName,
      href: `/${orgSlug}/sites/${siteKey}/stats`,
    },
    {
      name: currentPage === "stats" ? "Analytics" : "Settings",
      href: `/${orgSlug}/sites/${siteKey}/${currentPage}`,
      current: true,
    },
  ];

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-gray-500"
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, index) => {
        const Icon = breadcrumb.icon;
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={breadcrumb.href} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            )}

            {isLast ? (
              <span className="font-medium text-gray-900">
                {Icon && <Icon className="h-4 w-4 inline mr-1" />}
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-gray-700 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 inline mr-1" />}
                {breadcrumb.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
