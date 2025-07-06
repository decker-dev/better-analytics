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
import { Settings, Globe, Trash2, RotateCcw } from "lucide-react";

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
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage settings for {site.name}</p>
      </div>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Site Name
              </label>
              <input
                type="text"
                defaultValue={site.name}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Domain
              </label>
              <input
                type="text"
                defaultValue={site.domain || ""}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              rows={3}
              defaultValue={site.description || ""}
              placeholder="Describe your site..."
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Save Changes
            </button>
          </div>
        </CardContent>
      </Card>

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

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Regenerate Site Key</h4>
                <p className="text-sm text-muted-foreground">
                  Generate a new site key. This will require updating your
                  tracking code.
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Code */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">JavaScript Integration</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add this code to your website to start tracking analytics
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`import { Analytics } from 'better-analytics/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics
          api="${process.env.NEXT_PUBLIC_APP_URL}/api/collect"
          site="${site.siteKey}"
          debug={false}
        />
      </body>
    </html>
  );
}`}</code>
            </pre>
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
            <button
              type="button"
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Site
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
