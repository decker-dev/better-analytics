"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Settings } from "lucide-react";

interface OrgNavigationProps {
  orgSlug: string;
}

export const OrgNavigation = ({ orgSlug }: OrgNavigationProps) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Stats",
      href: `/${orgSlug}/stats`,
      icon: BarChart3,
      current: pathname === `/${orgSlug}/stats`,
    },
    {
      name: "Settings",
      href: `/${orgSlug}/settings`,
      icon: Settings,
      current: pathname === `/${orgSlug}/settings`,
    },
  ];

  return (
    <nav className="border-b bg-white">
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
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
