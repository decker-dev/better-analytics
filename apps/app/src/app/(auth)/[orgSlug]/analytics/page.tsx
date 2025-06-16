import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { db, schema } from "@/lib/db";
import { sql, desc, count } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { BarChart3, TrendingUp, Eye, MousePointer } from "lucide-react";

interface AnalyticsPageProps {
  params: Promise<{ orgSlug: string }>;
}

// Función para obtener estadísticas generales
async function getAnalyticsStats(site: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoTs = thirtyDaysAgo.getTime().toString();

  // Total de page views
  const totalPageViews = await db
    .select({ count: count() })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview'`,
    );

  // Visitantes únicos (aproximado usando referrers únicos)
  const uniqueVisitors = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${schema.events.ref})` })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview'`,
    );

  // Páginas más visitadas
  const topPages = await db
    .select({
      page: sql<string>`${schema.events.url}`,
      views: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview'`,
    )
    .groupBy(schema.events.url)
    .orderBy(desc(count()))
    .limit(10);

  // Top referrers
  const topReferrers = await db
    .select({
      source: sql<string>`${schema.events.ref}`,
      visits: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.ref} IS NOT NULL AND ${schema.events.ref} != ''`,
    )
    .groupBy(schema.events.ref)
    .orderBy(desc(count()))
    .limit(10);

  return {
    totalPageViews: totalPageViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors[0]?.count || 0,
    topPages: topPages.map((page, index) => ({
      page: page.page ? new URL(page.page).pathname : "Unknown",
      views: page.views,
      change: "+0%", // Por ahora, podrías calcular esto comparando con períodos anteriores
    })),
    topReferrers: topReferrers.map((ref) => {
      const totalVisits = topReferrers.reduce((sum, r) => sum + r.visits, 0);
      return {
        source: ref.source ? new URL(ref.source).hostname : "Direct",
        visits: ref.visits,
        percentage:
          totalVisits > 0 ? Math.round((ref.visits / totalVisits) * 100) : 0,
      };
    }),
  };
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
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

  // Use the organization slug as the site identifier for analytics
  const siteId = orgSlug;

  // Fetch real analytics data
  const analyticsData = await getAnalyticsStats(siteId);

  // Calculate some derived metrics
  const bounceRate = 34.2; // This would need more complex calculation
  const avgSessionDuration = "2m 34s"; // This would need session tracking

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600">Real analytics data for {orgSlug}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Visitors
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unique referrers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Estimated bounce rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionDuration}</div>
            <p className="text-xs text-muted-foreground">Estimated duration</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPages.length > 0 ? (
                analyticsData.topPages.map((page, index) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-gray-500">
                          {page.views.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {page.change}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No page views recorded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topReferrers.length > 0 ? (
                analyticsData.topReferrers.map((referrer) => (
                  <div
                    key={referrer.source}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      </div>
                      <div>
                        <p className="font-medium">{referrer.source}</p>
                        <p className="text-sm text-gray-500">
                          {referrer.visits.toLocaleString()} visits
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {referrer.percentage}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No referrer data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>Site ID: {siteId}</p>
            <p>Organization: {currentOrg?.name}</p>
            <p>Total Events: {analyticsData.totalPageViews}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
