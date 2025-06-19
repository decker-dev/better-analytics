import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Activity } from "lucide-react";
import type { AnalyticsStats } from "../../lib/analytics";

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
                key={`activity-${index}-${activity.timeAgo}`}
                className="flex items-start space-x-3 p-3 border rounded-lg bg-muted"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {activity.event}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.timeAgo}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.pathname}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {activity.browser} • {activity.os}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
