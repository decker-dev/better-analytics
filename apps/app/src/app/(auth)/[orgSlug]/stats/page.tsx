import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { db, schema } from "@/lib/db";
import { sql, desc, count, and, gte } from "drizzle-orm";
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
  Clock,
  Users,
  Activity,
  MapPin,
} from "lucide-react";

interface StatsPageProps {
  params: Promise<{ orgSlug: string }>;
}

// Función para obtener estadísticas completas
async function getComprehensiveStats(site: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Total de page views
  const totalPageViews = await db
    .select({ count: count() })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview'`,
    );

  // Page views últimos 7 días
  const weeklyPageViews = await db
    .select({ count: count() })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.ts} >= ${sevenDaysAgo.getTime().toString()}`,
    );

  // Page views últimas 24 horas
  const dailyPageViews = await db
    .select({ count: count() })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.ts} >= ${oneDayAgo.getTime().toString()}`,
    );

  // Visitantes únicos por sessionId
  const uniqueVisitors = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${schema.events.sessionId})` })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.sessionId} IS NOT NULL`,
    );

  // Páginas más visitadas
  const topPages = await db
    .select({
      page: sql<string>`${schema.events.pathname}`,
      title: sql<string>`${schema.events.pageTitle}`,
      views: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.evt} = 'pageview' AND ${schema.events.pathname} IS NOT NULL`,
    )
    .groupBy(schema.events.pathname, schema.events.pageTitle)
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

  // Dispositivos por vendor
  const deviceVendors = await db
    .select({
      vendor: sql<string>`COALESCE(${schema.events.deviceVendor}, 'Unknown')`,
      model: sql<string>`COALESCE(${schema.events.deviceModel}, 'Unknown')`,
      count: count(),
    })
    .from(schema.events)
    .where(sql`${schema.events.site} = ${site}`)
    .groupBy(schema.events.deviceVendor, schema.events.deviceModel)
    .orderBy(desc(count()))
    .limit(10);

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
    .limit(8);

  // Idiomas más comunes
  const topLanguages = await db
    .select({
      language: sql<string>`${schema.events.language}`,
      count: count(),
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.language} IS NOT NULL`,
    )
    .groupBy(schema.events.language)
    .orderBy(desc(count()))
    .limit(10);

  // Tiempo de carga promedio
  const avgLoadTime = await db
    .select({
      avg: sql<number>`AVG(CAST(${schema.events.loadTime} AS FLOAT))`,
    })
    .from(schema.events)
    .where(
      sql`${schema.events.site} = ${site} AND ${schema.events.loadTime} IS NOT NULL AND ${schema.events.loadTime} != '0'`,
    );

  // Actividad reciente
  const recentActivity = await db
    .select({
      evt: schema.events.evt,
      pathname: schema.events.pathname,
      pageTitle: schema.events.pageTitle,
      browser: schema.events.browser,
      os: schema.events.os,
      ts: schema.events.ts,
    })
    .from(schema.events)
    .where(sql`${schema.events.site} = ${site}`)
    .orderBy(desc(schema.events.ts))
    .limit(10);

  return {
    totalPageViews: totalPageViews[0]?.count || 0,
    weeklyPageViews: weeklyPageViews[0]?.count || 0,
    dailyPageViews: dailyPageViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors[0]?.count || 0,
    avgLoadTime: avgLoadTime[0]?.avg || 0,
    topPages: topPages.map((page) => ({
      page: page.page || "Unknown",
      title: page.title || "Untitled",
      views: page.views,
    })),
    topReferrers: topReferrers.map((ref) => {
      try {
        const hostname = ref.source ? new URL(ref.source).hostname : "Direct";
        return {
          source: hostname,
          visits: ref.visits,
        };
      } catch {
        return {
          source: ref.source || "Direct",
          visits: ref.visits,
        };
      }
    }),
    topBrowsers: topBrowsers.map((browser) => ({
      name: browser.browser || "Unknown",
      count: browser.count,
    })),
    topOS: topOS.map((os) => ({
      name: os.os || "Unknown",
      count: os.count,
    })),
    deviceVendors: deviceVendors.map((device) => ({
      vendor: device.vendor || "Unknown",
      model: device.model || "Unknown",
      count: device.count,
    })),
    topResolutions: topResolutions.map((res) => ({
      resolution: res.resolution || "Unknown",
      count: res.count,
    })),
    topLanguages: topLanguages.map((lang) => ({
      language: lang.language || "Unknown",
      count: lang.count,
    })),
    recentActivity: recentActivity.map((activity) => {
      const timestamp = Number.parseInt(activity.ts);
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      let timeAgo = "";
      if (diffMins < 1) {
        timeAgo = "Just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeAgo = `${hours}h ago`;
      } else {
        const days = Math.floor(diffMins / 1440);
        timeAgo = `${days}d ago`;
      }

      return {
        event: activity.evt,
        pathname: activity.pathname || "Unknown",
        title: activity.pageTitle || "Untitled",
        browser: activity.browser || "Unknown",
        os: activity.os || "Unknown",
        timeAgo,
      };
    }),
  };
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

  // Calculate bounce rate (simplified)
  const bounceRate =
    stats.uniqueVisitors > 0
      ? Math.round(
          ((stats.totalPageViews - stats.uniqueVisitors) /
            stats.totalPageViews) *
            100,
        )
      : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Stats</h1>
        <p className="text-gray-600">
          Comprehensive analytics for {currentOrg?.name || orgSlug}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.weeklyPageViews} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.dailyPageViews} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.avgLoadTime)}ms
            </div>
            <p className="text-xs text-muted-foreground">Page load speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">Estimated rate</p>
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
              {stats.topPages.length > 0 ? (
                stats.topPages.map((page, index) => (
                  <div
                    key={`page-${index}-${page.page}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{page.page}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {page.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {page.views.toLocaleString()}
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
              {stats.topReferrers.length > 0 ? (
                stats.topReferrers.map((referrer, index) => (
                  <div
                    key={`referrer-${index}-${referrer.source}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{referrer.source}</p>
                        <p className="text-sm text-gray-500">
                          {referrer.visits.toLocaleString()} visits
                        </p>
                      </div>
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

      {/* Technology Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Browsers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topBrowsers.length > 0 ? (
                stats.topBrowsers.map((browser, index) => (
                  <div
                    key={`browser-${index}-${browser.name}`}
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
              {stats.topOS.length > 0 ? (
                stats.topOS.map((os, index) => (
                  <div
                    key={`os-${index}-${os.name}`}
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

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLanguages.length > 0 ? (
                stats.topLanguages.map((lang, index) => (
                  <div
                    key={`lang-${index}-${lang.language}`}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{lang.language}</span>
                    <span className="text-sm text-gray-500">{lang.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No language data
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Device Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.deviceVendors.length > 0 ? (
                stats.deviceVendors.map((device, index) => (
                  <div
                    key={`device-${index}-${device.vendor}-${device.model}`}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {device.vendor}
                      </span>
                      <p className="text-xs text-gray-500">{device.model}</p>
                    </div>
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

        {/* Screen Resolutions */}
        <Card>
          <CardHeader>
            <CardTitle>Screen Resolutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {stats.topResolutions.length > 0 ? (
                stats.topResolutions.map((resolution, index) => (
                  <div
                    key={`resolution-${index}-${resolution.resolution}`}
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
                <div className="col-span-2">
                  <p className="text-gray-500 text-center py-4">
                    No resolution data
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div
                  key={`${activity.event}-${activity.pathname}-${index}`}
                  className="flex items-center space-x-4"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.event === "pageview"
                        ? "bg-green-500"
                        : activity.event === "click"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.event === "pageview"
                        ? "Page view"
                        : activity.event}{" "}
                      on {activity.pathname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.title} • {activity.browser} • {activity.os}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.timeAgo}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
