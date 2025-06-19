import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { BarChart3, Settings, Plus, Globe } from "lucide-react";
import Link from "next/link";
import type { Site } from "@/lib/db/schema";

interface SiteListProps {
  sites: Site[];
  orgSlug: string;
}

export const SiteList = ({ sites, orgSlug }: SiteListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-gray-600">
            Manage your sites and view their analytics
          </p>
        </div>
        <Link href={`/${orgSlug}/sites/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Site
          </Button>
        </Link>
      </div>

      {sites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {site.name}
                </CardTitle>
                {site.description && (
                  <p className="text-sm text-gray-600">{site.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Site Key:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {site.siteKey}
                    </code>
                  </div>
                  {site.domain && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Domain:</span>
                      <span className="truncate ml-2">{site.domain}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/${orgSlug}/sites/${site.siteKey}/stats`}
                    className="flex-1"
                  >
                    <Button variant="default" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/${orgSlug}/sites/${site.siteKey}/settings`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sites yet
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Create your first site to start tracking analytics
            </p>
            <Link href={`/${orgSlug}/sites/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Site
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
