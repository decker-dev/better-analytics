import { db, schema } from '@repo/database';
import { eq, and, desc, gte, isNotNull, ne, sql, count } from 'drizzle-orm';

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
    visits: number;
  }>;
  topOS: Array<{
    name: string;
    visits: number;
  }>;
  topCountries: Array<{
    name: string;
    visits: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topResolutions: Array<{
    resolution: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    event: string;
    timestamp: Date;
    page: string;
    country: string;
    browser: string;
    os: string;
  }>;
}

export async function getAnalyticsStats(siteKey: string): Promise<AnalyticsStats> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total page views
  const totalPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview')
      )
    );

  // Weekly page views
  const weeklyPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview'),
        gte(schema.events.timestamp, oneWeekAgo)
      )
    );

  // Daily page views
  const dailyPageViewsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview'),
        gte(schema.events.timestamp, oneDayAgo)
      )
    );

  // Unique visitors (based on sessionId)
  const uniqueVisitorsResult = await db
    .select({ count: sql<number>`count(distinct ${schema.events.sessionId})` })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.events.sessionId)
      )
    );

  // Average load time (only for web events)
  const avgLoadTimeResult = await db
    .select({ avg: sql<number>`avg(${schema.webEvents.loadTime})` })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview'),
        isNotNull(schema.webEvents.loadTime)
      )
    );

  // Top pages
  const topPagesResult = await db
    .select({
      page: schema.webEvents.pathname,
      title: schema.webEvents.pageTitle,
      views: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview'),
        isNotNull(schema.webEvents.pathname)
      )
    )
    .groupBy(schema.webEvents.pathname, schema.webEvents.pageTitle)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top referrers
  const topReferrersResult = await db
    .select({
      source: schema.events.referrer,
      visits: sql<number>`count(*)`
    })
    .from(schema.events)
    .where(
      and(
        eq(schema.events.site, siteKey),
        eq(schema.events.event, 'pageview'),
        isNotNull(schema.events.referrer),
        ne(schema.events.referrer, '')
      )
    )
    .groupBy(schema.events.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top browsers
  const topBrowsersResult = await db
    .select({
      name: schema.webEvents.browser,
      visits: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.webEvents.browser)
      )
    )
    .groupBy(schema.webEvents.browser)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top OS
  const topOSResult = await db
    .select({
      name: schema.webEvents.os,
      visits: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.webEvents.os)
      )
    )
    .groupBy(schema.webEvents.os)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Top countries
  const topCountriesResult = await db
    .select({
      name: schema.geoEvents.country,
      visits: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.geoEvents, eq(schema.events.id, schema.geoEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.geoEvents.country)
      )
    )
    .groupBy(schema.geoEvents.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Device stats
  const deviceStatsResult = await db
    .select({
      device: schema.webEvents.device,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.webEvents.device)
      )
    )
    .groupBy(schema.webEvents.device);

  // Top resolutions
  const topResolutionsResult = await db
    .select({
      resolution: sql<string>`concat(${schema.webEvents.screenWidth}, 'x', ${schema.webEvents.screenHeight})`,
      count: sql<number>`count(*)`
    })
    .from(schema.events)
    .innerJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .where(
      and(
        eq(schema.events.site, siteKey),
        isNotNull(schema.webEvents.screenWidth),
        isNotNull(schema.webEvents.screenHeight)
      )
    )
    .groupBy(sql`concat(${schema.webEvents.screenWidth}, 'x', ${schema.webEvents.screenHeight})`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Recent activity
  const recentActivityResult = await db
    .select({
      id: schema.events.id,
      event: schema.events.event,
      timestamp: schema.events.timestamp,
      page: schema.webEvents.pathname,
      country: schema.geoEvents.country,
      browser: schema.webEvents.browser,
      os: schema.webEvents.os,
    })
    .from(schema.events)
    .leftJoin(schema.webEvents, eq(schema.events.id, schema.webEvents.eventId))
    .leftJoin(schema.geoEvents, eq(schema.events.id, schema.geoEvents.eventId))
    .where(eq(schema.events.site, siteKey))
    .orderBy(desc(schema.events.timestamp))
    .limit(50);

  // Process device stats
  const deviceStats = deviceStatsResult.reduce(
    (acc, curr) => {
      const device = curr.device?.toLowerCase() || 'unknown';
      if (device.includes('mobile')) acc.mobile += curr.count;
      else if (device.includes('tablet')) acc.tablet += curr.count;
      else acc.desktop += curr.count;
      return acc;
    },
    { desktop: 0, mobile: 0, tablet: 0 }
  );

  return {
    totalPageViews: totalPageViewsResult[0]?.count || 0,
    weeklyPageViews: weeklyPageViewsResult[0]?.count || 0,
    dailyPageViews: dailyPageViewsResult[0]?.count || 0,
    uniqueVisitors: uniqueVisitorsResult[0]?.count || 0,
    avgLoadTime: Math.round(avgLoadTimeResult[0]?.avg || 0),
    topPages: topPagesResult.map(p => ({
      page: p.page || '/',
      title: p.title || 'Untitled',
      views: p.views
    })),
    topReferrers: topReferrersResult.map(r => ({
      source: r.source || 'Direct',
      visits: r.visits
    })),
    topBrowsers: topBrowsersResult.map(b => ({
      name: b.name || 'Unknown',
      visits: b.visits
    })),
    topOS: topOSResult.map(os => ({
      name: os.name || 'Unknown',
      visits: os.visits
    })),
    topCountries: topCountriesResult.map(c => ({
      name: c.name || 'Unknown',
      visits: c.visits
    })),
    deviceStats,
    topResolutions: topResolutionsResult.map(r => ({
      resolution: r.resolution,
      count: r.count
    })),
    recentActivity: recentActivityResult.map(a => ({
      id: a.id,
      event: a.event,
      timestamp: a.timestamp,
      page: a.page || '/',
      country: a.country || 'Unknown',
      browser: a.browser || 'Unknown',
      os: a.os || 'Unknown'
    }))
  };
} 