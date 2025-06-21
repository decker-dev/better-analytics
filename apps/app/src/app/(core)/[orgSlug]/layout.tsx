import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";
import {
  getCachedSession,
  getCachedOrganizations,
} from "@/modules/auth/lib/auth-cache";
import Header from "@/components/header";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/components/skeletons";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

// Separate header loading for better Suspense handling
async function HeaderContent({ orgSlug }: { orgSlug: string }) {
  // Middleware has already validated session and org access
  // We can safely get session and organizations (cached)
  const requestHeaders = await headers();
  const session = await getCachedSession(requestHeaders);
  const organizations = await getCachedOrganizations(requestHeaders);

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

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
    <Header
      organizations={organizations || []}
      currentOrg={currentOrg}
      sites={mappedSites}
    />
  );
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;

  return (
    <div className="min-h-screen">
      {/* Smart Header - detects context automatically */}
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderContent orgSlug={orgSlug} />
      </Suspense>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
