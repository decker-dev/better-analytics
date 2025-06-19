"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Globe, ExternalLink } from "lucide-react";
import type { Site } from "@/lib/db/schema";

interface SiteSelectorProps {
  currentSiteKey: string;
  organizationId: string;
  orgSlug: string;
}

export const SiteSelector = ({
  currentSiteKey,
  organizationId,
  orgSlug,
}: SiteSelectorProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentSite = sites.find((site) => site.siteKey === currentSiteKey);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch(`/api/sites?orgId=${organizationId}`);
        if (response.ok) {
          const sitesData = await response.json();
          setSites(sitesData);
        }
      } catch (error) {
        console.error("Failed to fetch sites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading sites...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-gray-700">
          {currentSite?.name || currentSiteKey}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                Switch Site
              </div>

              {sites.map((site) => (
                <Link
                  key={site.id}
                  href={`/${orgSlug}/sites/${site.siteKey}/stats`}
                  className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    site.siteKey === currentSiteKey
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{site.name}</div>
                      <div className="text-xs text-gray-500">
                        {site.siteKey}
                      </div>
                    </div>
                  </div>
                  {site.siteKey === currentSiteKey && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              ))}

              <div className="border-t">
                <Link
                  href={`/${orgSlug}/sites`}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <span>Manage All Sites</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
