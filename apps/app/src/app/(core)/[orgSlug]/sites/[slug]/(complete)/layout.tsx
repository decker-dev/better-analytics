import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import {
  getSiteBySlug,
  verifySiteOwnershipBySlug,
} from "@/modules/sites/lib/sites";
import { SiteNavigation } from "@/modules/sites/components/site-navigation";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; slug: string }>;
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { orgSlug, slug } = await params;

  // Middleware has already validated session and org access
  // We only need to verify site ownership and get org details
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  // Verify that the site exists and belongs to this organization
  const isOwner = await verifySiteOwnershipBySlug(slug, currentOrg.id);
  if (!isOwner) {
    notFound();
  }

  // Get site details
  const site = await getSiteBySlug(slug, currentOrg.id);
  if (!site) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Site Navigation */}
      <SiteNavigation orgSlug={orgSlug} slug={slug} />

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
