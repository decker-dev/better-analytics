"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Settings } from "lucide-react";

interface SiteNavigationProps {
  orgSlug: string;
  siteKey: string;
}

export const SiteNavigation = ({ orgSlug, siteKey }: SiteNavigationProps) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Analytics",
      href: `/${orgSlug}/sites/${siteKey}/stats`,
      icon: BarChart3,
      current: pathname === `/${orgSlug}/sites/${siteKey}/stats`,
    },
    {
      name: "Settings",
      href: `/${orgSlug}/sites/${siteKey}/settings`,
      icon: Settings,
      current: pathname === `/${orgSlug}/sites/${siteKey}/settings`,
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                  item.current
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
