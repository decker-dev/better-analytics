import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";
import {
  getCachedSession,
  getCachedOrganizations,
} from "@/modules/auth/lib/auth-cache";
import Header from "@/components/header";
import { notFound } from "next/navigation";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;

  // Middleware has already validated session and org access
  // We can safely get session and organizations (cached)
  const requestHeaders = await headers();
  const session = await getCachedSession(requestHeaders);
  const organizations = await getCachedOrganizations(requestHeaders);

  // Find the current organization (middleware guarantees it exists, but handle edge cases)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  // If currentOrg is not found, this could be due to cache timing after a redirect
  // Try to fetch fresh data
  if (!currentOrg) {
    // This should be rare, but handle the edge case where cache hasn't updated
    const freshOrganizations = await auth.api.listOrganizations({
      headers: requestHeaders,
    });
    const freshCurrentOrg = freshOrganizations?.find(
      (org) => org.slug === orgSlug,
    );

    if (!freshCurrentOrg) {
      // Organization truly doesn't exist or user doesn't have access
      notFound();
    }

    // Use fresh data
    const sites = await getSitesByOrg(freshCurrentOrg.id);
    const mappedSites = sites.map((site) => ({
      id: site.id,
      name: site.name,
      siteKey: site.siteKey,
    }));

    // Set active organization
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId: freshCurrentOrg.id,
      },
    });

    return (
      <div className="min-h-screen">
        <Header
          organizations={freshOrganizations || []}
          currentOrg={freshCurrentOrg}
          sites={mappedSites}
        />
        <main>{children}</main>
      </div>
    );
  }

  // Set active organization
  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: {
      organizationId: currentOrg.id,
    },
  });

  // Fetch all sites for the organization (for header dropdown)
  const sites = await getSitesByOrg(currentOrg.id);
  const mappedSites = sites.map((site) => ({
    id: site.id,
    name: site.name,
    siteKey: site.siteKey,
  }));

  return (
    <div className="min-h-screen">
      {/* Smart Header - detects context automatically */}
      <Header
        organizations={organizations || []}
        currentOrg={currentOrg}
        sites={mappedSites}
      />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
