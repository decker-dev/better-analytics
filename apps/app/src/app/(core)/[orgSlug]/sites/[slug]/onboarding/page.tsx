import { notFound } from "next/navigation";
import { getSiteBySlug, verifySiteOwnershipBySlug } from "@/lib/db/sites";
import { OnboardingFlow } from "@/modules/onboarding/components/onboarding-flow";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";

interface OnboardingPageProps {
  params: Promise<{
    orgSlug: string;
    slug: string;
  }>;
}

async function getSiteData(orgSlug: string, slug: string) {
  // Middleware has already validated session and org access
  // We only need to get org details and verify site ownership
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const organization = organizations?.find((org) => org.slug === orgSlug)!;

  // Verify site ownership and get site data
  const isOwner = await verifySiteOwnershipBySlug(slug, organization.id);
  if (!isOwner) {
    notFound();
  }

  const site = await getSiteBySlug(slug, organization.id);
  if (!site) {
    notFound();
  }

  return {
    site,
    organization,
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { orgSlug, slug } = await params;
  const { site, organization } = await getSiteData(orgSlug, slug);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <OnboardingFlow site={site} orgSlug={orgSlug} />
    </div>
  );
}

export async function generateMetadata({ params }: OnboardingPageProps) {
  const { orgSlug, slug } = await params;
  const { site } = await getSiteData(orgSlug, slug);

  return {
    title: `Setup ${site.name} - Better Analytics`,
    description: `Get started with Better Analytics for ${site.name}`,
  };
}
