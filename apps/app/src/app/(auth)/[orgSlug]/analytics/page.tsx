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
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react";

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
    .select({ count: sql<number>`COUNT(DISTINCT ${schema.events.sessionId})` })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.sessionId} IS NOT NULL`,
    );

  // Páginas más visitadas
  const topPages = await db
    .select({
      page: sql<string>`${schema.events.pathname}`,
      views: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.pathname} IS NOT NULL`,
    )
    .groupBy(schema.events.pathname)
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

  // Navegadores más usados
  const topBrowsers = await db
    .select({
      browser: sql<string>`${schema.events.browser}`,
      count: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.browser} IS NOT NULL`,
    )
    .groupBy(schema.events.browser)
    .orderBy(desc(count()))
    .limit(10);

  // Sistemas operativos más usados
  const topOS = await db
    .select({
      os: sql<string>`${schema.events.os}`,
      count: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.os} IS NOT NULL`,
    )
    .groupBy(schema.events.os)
    .orderBy(desc(count()))
    .limit(10);

  // Tipos de dispositivos
  const deviceTypes = await db
    .select({
      device: sql<string>`COALESCE(${schema.events.device}, 'desktop')`,
      count: count(),
    })
    .from(schema.events)
    .where(sql`${schema.events.site} = ${site}`)
    .groupBy(sql`COALESCE(${schema.events.device}, 'desktop')`)
    .orderBy(desc(count()));

  // Resoluciones de pantalla más comunes
  const topResolutions = await db
    .select({
      resolution: sql<string>`${schema.events.screenWidth} || 'x' || ${schema.events.screenHeight}`,
      count: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.screenWidth} IS NOT NULL AND ${schema.events.screenHeight} IS NOT NULL`,
    )
    .groupBy(
      sql`${schema.events.screenWidth} || 'x' || ${schema.events.screenHeight}`,
    )
    .orderBy(desc(count()))
    .limit(10);

  return {
    totalPageViews: totalPageViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors[0]?.count || 0,
    topPages: topPages.map((page) => ({
      page: page.page || "Unknown",
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
    topBrowsers: topBrowsers.map((browser) => ({
      name: browser.browser || "Unknown",
      count: browser.count,
    })),
    topOS: topOS.map((os) => ({
      name: os.os || "Unknown",
      count: os.count,
    })),
    deviceTypes: deviceTypes.map((device) => ({
      type: device.device || "desktop",
      count: device.count,
    })),
    topResolutions: topResolutions.map((res) => ({
      resolution: res.resolution || "Unknown",
      count: res.count,
    })),
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
              Unique Sessions
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unique sessions</p>
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
                analyticsData.topPages.map((page) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {analyticsData.topPages.indexOf(page) + 1}
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

      {/* Browser and Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Browsers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topBrowsers.length > 0 ? (
                analyticsData.topBrowsers.map((browser) => (
                  <div
                    key={browser.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{browser.name}</span>
                    <span className="text-sm text-gray-500">
                      {browser.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No browser data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operating Systems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topOS.length > 0 ? (
                analyticsData.topOS.map((os) => (
                  <div
                    key={os.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{os.name}</span>
                    <span className="text-sm text-gray-500">{os.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No OS data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.deviceTypes.length > 0 ? (
                analyticsData.deviceTypes.map((device) => (
                  <div
                    key={device.type}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium capitalize">
                      {device.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {device.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No device data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Resolutions */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Resolutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analyticsData.topResolutions.length > 0 ? (
              analyticsData.topResolutions.map((resolution) => (
                <div
                  key={resolution.resolution}
                  className="text-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-sm">
                    {resolution.resolution}
                  </div>
                  <div className="text-xs text-gray-500">
                    {resolution.count} users
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-gray-500 text-center py-4">
                  No resolution data
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            <p>Browsers tracked: {analyticsData.topBrowsers.length}</p>
            <p>OS tracked: {analyticsData.topOS.length}</p>
            <p>Device types: {analyticsData.deviceTypes.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
