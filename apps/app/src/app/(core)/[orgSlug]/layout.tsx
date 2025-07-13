import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/modules/sites/lib/sites";
import { getCachedOrganizations } from "@/modules/auth/lib/auth-cache";
import Header from "@/components/header";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;

  const requestHeaders = await headers();
  const organizations = await getCachedOrganizations(requestHeaders);

  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: {
      organizationId: currentOrg.id,
    },
  });

  const sites = await getSitesByOrg(currentOrg.id);
  const mappedSites = sites.map((site) => ({
    id: site.id,
    name: site.name,
    slug: site.slug,
  }));

  return (
    <div className="min-h-screen">
      <Header
        organizations={organizations || []}
        currentOrg={currentOrg}
        sites={mappedSites}
      />
      <main>{children}</main>
    </div>
  );
}
