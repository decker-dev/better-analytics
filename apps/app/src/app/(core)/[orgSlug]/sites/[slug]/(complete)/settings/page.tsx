import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import {
  getSiteBySlug,
  verifySiteOwnershipBySlug,
} from "@/modules/sites/lib/sites";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Settings, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { UpdateSiteForm } from "@/modules/sites/components/update-site-form";
import { DeleteSiteDialog } from "@/modules/sites/components/delete-site-dialog";

interface SiteSettingsPageProps {
  params: Promise<{ orgSlug: string; slug: string }>;
}

export default async function SiteSettingsPage({
  params,
}: SiteSettingsPageProps) {
  const { orgSlug, slug } = await params;

  // Middleware has already validated session and org access
  // We only need to verify site ownership and get org details
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  // Verify that the site exists and belongs to this organization
  const isOwner = await verifySiteOwnershipBySlug(slug, currentOrg.id);
  if (!isOwner) {
    notFound();
  }

  // Get site details
  const site = await getSiteBySlug(slug, currentOrg.id);
  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Site Information */}

      <UpdateSiteForm site={site} orgSlug={orgSlug} />

      {/* Site Key Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Site Key</h4>
              <p className="text-sm text-muted-foreground">
                Use this key to identify your site in analytics tracking
              </p>
            </div>
            <code className="bg-muted px-3 py-2 rounded text-sm">
              {site.siteKey}
            </code>
          </div>
        </CardContent>
      </Card>
      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Site</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this site and all its analytics data. This
                action cannot be undone.
              </p>
            </div>
            <DeleteSiteDialog
              siteId={site.id}
              siteName={site.name}
              orgSlug={orgSlug}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
