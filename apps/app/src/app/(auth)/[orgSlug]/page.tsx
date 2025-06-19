import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSitesByOrg } from "@/lib/db/sites";

interface OrgRootPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgRootPage({ params }: OrgRootPageProps) {
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

  // If there's only one site, redirect directly to its analytics
  if (sites.length === 1 && sites[0]) {
    redirect(`/${orgSlug}/sites/${sites[0].siteKey}/stats`);
  }

  // Otherwise, redirect to sites management
  redirect(`/${orgSlug}/sites`);
}
