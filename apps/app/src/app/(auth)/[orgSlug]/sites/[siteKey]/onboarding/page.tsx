import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { OnboardingFlow } from "@/modules/onboarding/components/onboarding-flow";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";

interface OnboardingPageProps {
  params: Promise<{
    orgSlug: string;
    siteKey: string;
  }>;
}

async function getSiteData(orgSlug: string, siteKey: string) {
  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization
  const organization = organizations?.find((org) => org.slug === orgSlug);

  if (!organization) {
    notFound();
  }

  const [site] = await db
    .select()
    .from(sites)
    .where(
      and(
        eq(sites.siteKey, siteKey),
        eq(sites.organizationId, organization.id),
      ),
    )
    .limit(1);

  if (!site) {
    notFound();
  }

  return {
    site,
    organization,
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { orgSlug, siteKey } = await params;
  const { site, organization } = await getSiteData(orgSlug, siteKey);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <Suspense fallback={<div>Loading...</div>}>
        <OnboardingFlow
          site={site}
          orgSlug={orgSlug}
          apiEndpoint={process.env.NEXT_PUBLIC_BA_URL || "/api/collect"}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: OnboardingPageProps) {
  const { orgSlug, siteKey } = await params;
  const { site } = await getSiteData(orgSlug, siteKey);

  return {
    title: `Setup ${site.name} - Better Analytics`,
    description: `Get started with Better Analytics for ${site.name}`,
  };
}
