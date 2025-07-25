import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import {
  getSiteBySlug,
  verifySiteOwnershipBySlug,
} from "@/modules/sites/lib/sites";
import { getAnalyticsStats } from "@/modules/sites/lib/analytics";
import { KeyMetrics } from "@/modules/sites/components/analytics/key-metrics";
import { TopPagesAndReferrers } from "@/modules/sites/components/analytics/top-pages-and-referrers";
import { TechnologyStats } from "@/modules/sites/components/analytics/technology-stats";
import { DeviceInfo } from "@/modules/sites/components/analytics/device-info";
import { RecentActivity } from "@/modules/sites/components/analytics/recent-activity";

interface SiteStatsPageProps {
  params: Promise<{ orgSlug: string; slug: string }>;
}

export default async function SiteStatsPage({ params }: SiteStatsPageProps) {
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

  // Fetch comprehensive analytics data for this site
  const stats = await getAnalyticsStats(site.siteKey);

  // Calculate bounce rate (simple approximation)
  const bounceRate =
    stats.uniqueVisitors > 0
      ? Math.round((1 - stats.totalPageViews / stats.uniqueVisitors) * 100)
      : 0;

  return (
    <div className="space-y-6">
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
    </div>
  );
}
