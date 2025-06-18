import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Eye, Users, Clock, TrendingUp } from "lucide-react";
import type { AnalyticsStats } from "../lib/analytics";

interface KeyMetricsProps {
  stats: AnalyticsStats;
  bounceRate: number;
}

export const KeyMetrics = ({ stats, bounceRate }: KeyMetricsProps) => {
  return (
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
          <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
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
  );
};
