import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Monitor, Globe } from "lucide-react";
import type { AnalyticsStats } from "../../lib/analytics";

interface TechnologyStatsProps {
  stats: AnalyticsStats;
}

export const TechnologyStats = ({ stats }: TechnologyStatsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Browsers */}
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
                  <span className="text-sm text-muted-foreground">
                    {browser.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
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
                  <span className="text-sm text-muted-foreground">
                    {os.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No OS data
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
