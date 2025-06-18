import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Activity } from "lucide-react";
import type { AnalyticsStats } from "../lib/analytics";

interface RecentActivityProps {
  stats: AnalyticsStats;
}

export const RecentActivity = ({ stats }: RecentActivityProps) => {
  return (
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
                <div className="text-xs text-gray-500">{activity.timeAgo}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
