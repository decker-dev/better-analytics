import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSiteByKey, verifySiteOwnership } from "@/lib/db/sites";
import { SiteBreadcrumbWrapper } from "@/modules/sites/components/site-breadcrumb-wrapper";
import { SiteNavigation } from "@/modules/sites/components/site-navigation";
import { SiteSelector } from "@/modules/sites/components/site-selector";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; siteKey: string }>;
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { orgSlug, siteKey } = await params;

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization
  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  if (!currentOrg) {
    redirect("/");
  }

  // Verify that the site exists and belongs to this organization
  const isOwner = await verifySiteOwnership(siteKey, currentOrg.id);
  if (!isOwner) {
    notFound();
  }

  // Get site details
  const site = await getSiteByKey(siteKey);
  if (!site) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Site Header with Selector */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">{site.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Site Key:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {siteKey}
                </code>
              </div>
            </div>

            {/* Site Selector */}
            <SiteSelector
              currentSiteKey={siteKey}
              organizationId={currentOrg.id}
              orgSlug={orgSlug}
            />
          </div>
        </div>
      </div>

      {/* Site Navigation */}
      <SiteNavigation orgSlug={orgSlug} siteKey={siteKey} />

      {/* Main Content */}
      <main className="p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <SiteBreadcrumbWrapper
            orgSlug={orgSlug}
            orgName={currentOrg.name}
            siteName={site.name}
            siteKey={siteKey}
          />
        </div>

        {children}
      </main>
    </div>
  );
}
