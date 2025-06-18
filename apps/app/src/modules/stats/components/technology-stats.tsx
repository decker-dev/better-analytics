import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Globe, Monitor, MapPin } from "lucide-react";
import type { AnalyticsStats } from "../lib/analytics";

interface TechnologyStatsProps {
  stats: AnalyticsStats;
}

export const TechnologyStats = ({ stats }: TechnologyStatsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Browsers */}
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
                  <span className="text-sm text-gray-500">{browser.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No browser data</p>
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
                  <span className="text-sm text-gray-500">{os.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No OS data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topLanguages.length > 0 ? (
              stats.topLanguages.map((lang, index) => (
                <div
                  key={`lang-${index}-${lang.language}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{lang.language}</span>
                  <span className="text-sm text-gray-500">{lang.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No language data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
