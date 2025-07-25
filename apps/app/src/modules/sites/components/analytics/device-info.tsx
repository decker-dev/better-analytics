import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Smartphone } from "lucide-react";
import type { AnalyticsStats } from "../../lib/analytics";

interface DeviceInfoProps {
  stats: AnalyticsStats;
}

export const DeviceInfo = ({ stats }: DeviceInfoProps) => {
  return (
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
            {Object.entries(stats.deviceStats).map(([deviceType, count]) => (
              <div
                key={deviceType}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-medium capitalize">{deviceType}</span>
                  <p className="text-xs text-muted-foreground">
                    {count > 0 ? `${count} visits` : 'No visits'}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {count}
                </span>
              </div>
            ))}
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
                  className="text-center p-3 bg-muted rounded-lg"
                >
                  <div className="font-medium text-sm">
                    {resolution.resolution}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {resolution.count} users
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2">
                <p className="text-muted-foreground text-center py-4">
                  No resolution data
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
