"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { BarChart3, Settings, Plus, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Site } from "@/lib/db/schema";
import { createSiteAction } from "../actions/create-site";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

interface SiteListProps {
  sites: Site[];
  orgSlug: string;
  organizationId: string;
}

export function SiteList({ sites, orgSlug, organizationId }: SiteListProps) {
  const router = useRouter();

  const {
    execute: createSite,
    isExecuting: creating,
    result,
    hasSucceeded,
  } = useAction(createSiteAction);

  useEffect(() => {
    if (hasSucceeded && result?.data?.data) {
      const actionResult = result.data.data;
      router.push(`/${orgSlug}/sites/${actionResult.siteSlug}/onboarding`);
    }
  }, [hasSucceeded, result, router, orgSlug]);

  const handleCreateSite = () => {
    createSite({
      organizationId,
      orgSlug,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            Manage your sites and view their analytics
          </p>
        </div>
        <Button disabled={creating} onClick={handleCreateSite}>
          {creating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create New Site
        </Button>
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
                  <p className="text-sm text-muted-foreground">
                    {site.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {site.domain && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="truncate ml-2">{site.domain}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/${orgSlug}/sites/${site.slug}/stats`}
                    className="flex-1"
                  >
                    <Button variant="default" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/${orgSlug}/sites/${site.slug}/settings`}>
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
            <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No sites yet
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first site to start tracking analytics
            </p>
            <Button disabled={creating} onClick={handleCreateSite}>
              {creating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Your First Site
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
