import { db, schema } from '@/modules/shared/lib/db';
import { eq, and, desc, gte, isNotNull, ne, sql } from 'drizzle-orm';

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

/**
 * Get comprehensive analytics stats for a specific site
 */
export async function getComprehensiveStats(siteKey: string): Promise<AnalyticsStats> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Total page views
  const totalPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.evt, 'pageview')
      )
    );

  // Weekly page views
  const weeklyPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.evt, 'pageview'),
        gte(schema.events.createdAt, oneWeekAgo)
      )
    );

  // Daily page views
  const dailyPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.evt, 'pageview'),
        gte(schema.events.createdAt, oneDayAgo)
      )
    );

  // Unique visitors (by session ID)
  const uniqueVisitorsResult = await db
    .select({ count: sql<number>`count(distinct ${schema.events.sessionId})` })
    .from(schema.events)
    .where(eq(schema.events.site, siteKey));

  // Average load time
  const avgLoadTimeResult = await db
    .select({ avg: sql<number>`avg(${schema.events.loadTime})` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.loadTime)
      )
    );

  // Top pages
  const topPages = await db
    .select({
      page: schema.events.pathname,
      title: schema.events.pageTitle,
      views: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.evt, 'pageview'),
        isNotNull(schema.events.pathname)
      )
    )
    .groupBy(schema.events.pathname, schema.events.pageTitle)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top referrers
  const topReferrers = await db
    .select({
      source: schema.events.ref,
      visits: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.evt, 'pageview'),
        isNotNull(schema.events.ref),
        ne(schema.events.ref, '')
      )
    )
    .groupBy(schema.events.ref)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top browsers
  const topBrowsers = await db
    .select({
      name: schema.events.browser,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.browser)
      )
    )
    .groupBy(schema.events.browser)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top OS
  const topOS = await db
    .select({
      name: schema.events.os,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.os)
      )
    )
    .groupBy(schema.events.os)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Device vendors
  const deviceVendors = await db
    .select({
      vendor: schema.events.deviceVendor,
      model: schema.events.deviceModel,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.deviceVendor)
      )
    )
    .groupBy(schema.events.deviceVendor, schema.events.deviceModel)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top screen resolutions
  const topResolutions = await db
    .select({
      resolution: sql<string>`concat(${schema.events.screenWidth}, 'x', ${schema.events.screenHeight})`,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.screenWidth),
        isNotNull(schema.events.screenHeight)
      )
    )
    .groupBy(sql`concat(${schema.events.screenWidth}, 'x', ${schema.events.screenHeight})`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top languages
  const topLanguages = await db
    .select({
      language: schema.events.language,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.language)
      )
    )
    .groupBy(schema.events.language)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Recent activity
  const recentActivityRaw = await db
    .select({
      event: schema.events.evt,
      pathname: schema.events.pathname,
      title: schema.events.pageTitle,
      browser: schema.events.browser,
      os: schema.events.os,
      createdAt: schema.events.createdAt
    })
    .from(schema.events)
    .where(eq(schema.events.site, siteKey))
    .orderBy(desc(schema.events.createdAt))
    .limit(20);

  // Format recent activity with time ago
  const recentActivity = recentActivityRaw.map(activity => ({
    event: activity.event || 'unknown',
    pathname: activity.pathname || '/',
    title: activity.title || 'Untitled',
    browser: activity.browser || 'Unknown',
    os: activity.os || 'Unknown',
    timeAgo: formatTimeAgo(activity.createdAt || new Date())
  }));

  return {
    totalPageViews: totalPageViewsResult[0]?.count || 0,
    weeklyPageViews: weeklyPageViewsResult[0]?.count || 0,
    dailyPageViews: dailyPageViewsResult[0]?.count || 0,
    uniqueVisitors: uniqueVisitorsResult[0]?.count || 0,
    avgLoadTime: avgLoadTimeResult[0]?.avg || 0,
    topPages: topPages.map(p => ({
      page: p.page || '/',
      title: p.title || 'Untitled',
      views: p.views
    })),
    topReferrers: topReferrers.map(r => ({
      source: r.source || 'Direct',
      visits: r.visits
    })),
    topBrowsers: topBrowsers.map(b => ({
      name: b.name || 'Unknown',
      count: b.count
    })),
    topOS: topOS.map(os => ({
      name: os.name || 'Unknown',
      count: os.count
    })),
    deviceVendors: deviceVendors.map(d => ({
      vendor: d.vendor || 'Unknown',
      model: d.model || 'Unknown',
      count: d.count
    })),
    topResolutions: topResolutions.map(r => ({
      resolution: r.resolution || 'Unknown',
      count: r.count
    })),
    topLanguages: topLanguages.map(l => ({
      language: l.language || 'Unknown',
      count: l.count
    })),
    recentActivity
  };
}

/**
 * Calculate bounce rate based on page views and unique visitors
 */
export function calculateBounceRate(totalPageViews: number, uniqueVisitors: number): number {
  if (uniqueVisitors === 0) return 0;

  // Simple estimation: if pageviews per visitor is close to 1, it's likely a bounce
  const avgPageViewsPerVisitor = totalPageViews / uniqueVisitors;
  const bounceRate = Math.max(0, Math.min(100, (2 - avgPageViewsPerVisitor) * 100));

  return Math.round(bounceRate);
}

/**
 * Format a date as time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString();
} 