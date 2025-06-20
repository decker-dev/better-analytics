import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";

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

  // Always redirect to sites management page for consistency
  redirect(`/${orgSlug}/sites`);
}
