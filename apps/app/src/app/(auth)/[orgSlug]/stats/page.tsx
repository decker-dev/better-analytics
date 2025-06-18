import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  getComprehensiveStats,
  calculateBounceRate,
} from "@/modules/stats/lib/analytics";
import { KeyMetrics } from "@/modules/stats/components/key-metrics";
import { TopPagesAndReferrers } from "@/modules/stats/components/top-pages-and-referrers";
import { TechnologyStats } from "@/modules/stats/components/technology-stats";
import { DeviceInfo } from "@/modules/stats/components/device-info";
import { RecentActivity } from "@/modules/stats/components/recent-activity";

interface StatsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { orgSlug } = await params;

  // Get active organization (set by layout)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get organizations to find the current one
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  // Use demo-app as the site identifier for analytics (based on your data)
  const siteId = "demo-app";

  // Fetch comprehensive analytics data
  const stats = await getComprehensiveStats(siteId);

  // Calculate bounce rate
  const bounceRate = calculateBounceRate(
    stats.totalPageViews,
    stats.uniqueVisitors,
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Stats</h1>
        <p className="text-gray-600">
          Comprehensive analytics for {currentOrg?.name || orgSlug}
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
    </div>
  );
}
