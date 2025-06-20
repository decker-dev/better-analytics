import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSiteByKey, verifySiteOwnership } from "@/lib/db/sites";
import {
  getComprehensiveStats,
  calculateBounceRate,
} from "@/modules/sites/lib/analytics";
import { KeyMetrics } from "@/modules/sites/components/analytics/key-metrics";
import { TopPagesAndReferrers } from "@/modules/sites/components/analytics/top-pages-and-referrers";
import { TechnologyStats } from "@/modules/sites/components/analytics/technology-stats";
import { DeviceInfo } from "@/modules/sites/components/analytics/device-info";
import { RecentActivity } from "@/modules/sites/components/analytics/recent-activity";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/skeletons";

interface SiteStatsPageProps {
  params: Promise<{ orgSlug: string; siteKey: string }>;
}

// Separate analytics data fetching into a component for better Suspense handling
async function AnalyticsContent({
  siteKey,
  siteName,
}: { siteKey: string; siteName: string }) {
  // Fetch comprehensive analytics data for this site
  const stats = await getComprehensiveStats(siteKey);

  // Calculate bounce rate
  const bounceRate = calculateBounceRate(
    stats.totalPageViews,
    stats.uniqueVisitors,
  );

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">{siteName} Analytics</h1>
        <p className="text-muted-foreground">
          Analytics dashboard for {siteName}
        </p>
      </div>

      {/* Key Metrics */}
      <KeyMetrics stats={stats} bounceRate={bounceRate} />

      {/* Top Pages and Referrers */}
      <TopPagesAndReferrers stats={stats} />

      {/* Technology Stats */}
      <TechnologyStats stats={stats} />

      {/* Device Information */}
      <DeviceInfo stats={stats} />

      {/* Recent Activity */}
      <RecentActivity stats={stats} />
    </>
  );
}

export default async function SiteStatsPage({ params }: SiteStatsPageProps) {
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
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsContent siteKey={siteKey} siteName={site.name} />
      </Suspense>
    </div>
  );
}
