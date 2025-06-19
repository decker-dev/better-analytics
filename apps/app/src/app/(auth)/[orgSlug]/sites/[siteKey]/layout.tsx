import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import {
  getSiteByKey,
  verifySiteOwnership,
  getSitesByOrg,
} from "@/lib/db/sites";
import { SiteBreadcrumbWrapper } from "@/modules/sites/components/site-breadcrumb-wrapper";
import { SiteNavigation } from "@/modules/sites/components/site-navigation";
import Header from "@/components/header";

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

  // Get all sites for the organization
  const sites = await getSitesByOrg(currentOrg.id);

  return (
    <div className="min-h-screen">
      {/* Site Header */}
      <Header
        organizations={organizations || []}
        currentOrg={currentOrg}
        sites={sites.map((s) => ({
          id: s.id,
          name: s.name,
          siteKey: s.siteKey,
        }))}
        currentSite={{ id: site.id, name: site.name, siteKey: site.siteKey }}
        context="site"
      />

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
