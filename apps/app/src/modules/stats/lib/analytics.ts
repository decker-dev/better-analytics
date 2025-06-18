import { db, schema } from "@/lib/db";
import { sql, desc, count } from "drizzle-orm";

export interface AnalyticsStats {
  totalPageViews: number;
  weeklyPageViews: number;
  dailyPageViews: number;
  uniqueVisitors: number;
  avgLoadTime: number;
  topPages: Array<{
    page: string;
    title: string;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  topBrowsers: Array<{
    name: string;
    count: number;
  }>;
  topOS: Array<{
    name: string;
    count: number;
  }>;
  deviceVendors: Array<{
    vendor: string;
    model: string;
    count: number;
  }>;
  topResolutions: Array<{
    resolution: string;
    count: number;
  }>;
  topLanguages: Array<{
    language: string;
    count: number;
  }>;
  recentActivity: Array<{
    event: string;
    pathname: string;
    title: string;
    browser: string;
    os: string;
    timeAgo: string;
  }>;
}

export async function getComprehensiveStats(site: string): Promise<AnalyticsStats> {
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

export function calculateBounceRate(totalPageViews: number, uniqueVisitors: number): number {
  return uniqueVisitors > 0
    ? Math.round(((totalPageViews - uniqueVisitors) / totalPageViews) * 100)
    : 0;
} 