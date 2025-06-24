import { headers } from "next/headers";
import { notFound } from "next/navigation";
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

  // Middleware has already validated session and org access
  // We only need to verify site ownership and get org details
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

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
