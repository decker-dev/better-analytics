import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";
import Header from "@/components/header";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/components/skeletons";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

// Separate header loading for better Suspense handling
async function HeaderContent({ orgSlug }: { orgSlug: string }) {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/sign-in");
  }

  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the requested organization
  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  // If organization doesn't exist or user doesn't have access
  if (!currentOrg) {
    notFound();
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
