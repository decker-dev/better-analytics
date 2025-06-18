import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Globe } from "lucide-react";
import type { AnalyticsStats } from "../lib/analytics";

interface TopPagesAndReferrersProps {
  stats: AnalyticsStats;
}

export const TopPagesAndReferrers = ({ stats }: TopPagesAndReferrersProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topPages.length > 0 ? (
              stats.topPages.map((page, index) => (
                <div
                  key={`page-${index}-${page.page}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{page.page}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {page.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {page.views.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No page views recorded yet
              </p>
            )}
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
            {stats.topReferrers.length > 0 ? (
              stats.topReferrers.map((referrer, index) => (
                <div
                  key={`referrer-${index}-${referrer.source}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{referrer.source}</p>
                      <p className="text-sm text-gray-500">
                        {referrer.visits.toLocaleString()} visits
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No referrer data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
