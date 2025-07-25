import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/modules/sites/lib/sites";
import { SiteList } from "@/modules/sites/components/site-list";

interface SitesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SitesPage({ params }: SitesPageProps) {
  const { orgSlug } = await params;
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  const sites = await getSitesByOrg(currentOrg.id);

  return (
    <div className="p-6">
      <SiteList
        sites={sites}
        orgSlug={orgSlug}
        organizationId={currentOrg.id}
      />
    </div>
  );
}
