"use client";

import { useActionState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { BarChart3, Settings, Plus, Globe, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import Link from "next/link";
import type { Site } from "@repo/database";
import { createSite } from "../actions/create-site";
import type { ActionState } from "@/modules/shared/lib/middleware-action";

interface SiteListProps {
  sites: Site[];
  orgSlug: string;
  organizationId: string;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export function SiteList({ sites, orgSlug, organizationId }: SiteListProps) {
  const [state, action, isPending] = useActionState(createSite, initialState);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            Manage your sites and view their analytics
          </p>
        </div>
        <form action={action}>
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <Button type="submit" disabled={isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {isPending ? "Creating..." : "Create New Site"}
          </Button>
        </form>
      </div>

      {state?.message && !state.success && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.message && state.success && (
        <Alert variant="default">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

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
            <form action={action}>
              <input
                type="hidden"
                name="organizationId"
                value={organizationId}
              />
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <Button type="submit" disabled={isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {isPending ? "Creating..." : "Create Your First Site"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
