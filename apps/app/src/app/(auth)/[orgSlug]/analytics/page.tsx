import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
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

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { orgSlug } = await params;

  // Get active organization (set by layout)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Here you would fetch organization-specific analytics data from your database
  // For now, we'll use mock data
  const analyticsData = {
    pageViews: [
      { page: "/home", views: 1234, change: "+12%" },
      { page: "/products", views: 987, change: "+8%" },
      { page: "/about", views: 654, change: "-3%" },
      { page: "/contact", views: 432, change: "+15%" },
    ],
    topReferrers: [
      { source: "google.com", visits: 2341, percentage: 45 },
      { source: "twitter.com", visits: 1234, percentage: 24 },
      { source: "facebook.com", visits: 987, percentage: 19 },
      { source: "direct", visits: 654, percentage: 12 },
    ],
    metrics: {
      totalPageViews: 15432,
      uniqueVisitors: 8921,
      bounceRate: 34.2,
      avgSessionDuration: "2m 34s",
    },
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600">Detailed analytics for {orgSlug}</p>
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
              {analyticsData.metrics.totalPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
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
              {analyticsData.metrics.uniqueVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.metrics.bounceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              -2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.metrics.avgSessionDuration}
            </div>
            <p className="text-xs text-muted-foreground">
              +15s from last month
            </p>
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
              {analyticsData.pageViews.map((page, index) => (
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
                  <div
                    className={`text-sm font-medium ${
                      page.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {page.change}
                  </div>
                </div>
              ))}
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
              {analyticsData.topReferrers.map((referrer) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
