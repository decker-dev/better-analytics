import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";
import { SiteList } from "@/modules/sites/components/site-list";
import { Suspense } from "react";
import { SiteListSkeleton } from "@/components/skeletons";

interface SitesPageProps {
  params: Promise<{ orgSlug: string }>;
}

// Separate sites loading into its own component for Suspense
async function SitesContent({
  orgSlug,
  organizationId,
}: { orgSlug: string; organizationId: string }) {
  // Get sites for this organization
  const sites = await getSitesByOrg(organizationId);

  return (
    <div className="p-6">
      <SiteList
        sites={sites}
        orgSlug={orgSlug}
        organizationId={organizationId}
      />
    </div>
  );
}

export default async function SitesPage({ params }: SitesPageProps) {
  const { orgSlug } = await params;

  // Middleware has already validated session and org access
  // We can safely get organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  return (
    <Suspense fallback={<SiteListSkeleton />}>
      <SitesContent orgSlug={orgSlug} organizationId={currentOrg.id} />
    </Suspense>
  );
}
