import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";
import { SiteList } from "@/modules/sites/components/site-list";

interface SitesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SitesPage({ params }: SitesPageProps) {
  const { orgSlug } = await params;

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

  // Get sites for this organization
  const sites = await getSitesByOrg(currentOrg.id);

  return (
    <div className="p-6">
      <SiteList sites={sites} orgSlug={orgSlug} />
    </div>
  );
}
