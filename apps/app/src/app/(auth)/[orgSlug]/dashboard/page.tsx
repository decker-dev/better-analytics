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
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

// Función para obtener estadísticas del dashboard
async function getDashboardStats(site: string) {
  // Total de page views
  const totalViews = await db
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

  // Eventos recientes para la actividad
  const recentEvents = await db
    .select({
      evt: schema.events.evt,
      url: schema.events.url,
      ts: schema.events.ts,
    })
    .from(schema.events)
    .where(sql`${schema.events.site} = ${site}`)
    .orderBy(desc(schema.events.ts))
    .limit(5);

  return {
    totalViews: totalViews[0]?.count || 0,
    uniqueVisitors: uniqueVisitors[0]?.count || 0,
    conversionRate: 3.2, // Esto requeriría lógica más compleja
    activeUsers: Math.floor(Math.random() * 200) + 50, // Simulado por ahora
    recentEvents: recentEvents.map((event) => {
      const timestamp = Number.parseInt(event.ts);
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      let timeAgo = "";
      if (diffMins < 1) {
        timeAgo = "Just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} minutes ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else {
        const days = Math.floor(diffMins / 1440);
        timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
      }

      return {
        event: event.evt,
        url: event.url ? new URL(event.url).pathname : "Unknown",
        timeAgo,
      };
    }),
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params;

  // Get active organization (set by layout)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Use the organization slug as the site identifier for analytics
  const siteId = "demo-app";

  // Fetch real dashboard data
  const stats = await getDashboardStats(siteId);
  console.log(stats);
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Analytics overview for your organization
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unique referrers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Estimated rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Estimated active</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.length > 0 ? (
              stats.recentEvents.map((activity) => (
                <div
                  key={`${activity.event}-${activity.url}-${activity.timeAgo}`}
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
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.event === "pageview"
                        ? "Page view"
                        : activity.event === "click"
                          ? "Click event"
                          : `${activity.event} event`}{" "}
                      on {activity.url}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
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

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>Site ID: {siteId}</p>
            <p>Total Events: {stats.totalViews}</p>
            <p>Recent Events: {stats.recentEvents.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
