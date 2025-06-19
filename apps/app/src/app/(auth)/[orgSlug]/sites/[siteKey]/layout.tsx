import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSiteByKey, verifySiteOwnership } from "@/lib/db/sites";
import { SiteNavigation } from "@/modules/sites/components/site-navigation";

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

  return (
    <div className="min-h-screen">
      {/* Site Navigation */}
      <SiteNavigation orgSlug={orgSlug} siteKey={siteKey} />

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
