import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { FileText, ExternalLink } from "lucide-react";
import type { AnalyticsStats } from "../../lib/analytics";

interface TopPagesAndReferrersProps {
  stats: AnalyticsStats;
}

export const TopPagesAndReferrers = ({ stats }: TopPagesAndReferrersProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Top Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topPages.length > 0 ? (
              stats.topPages.map((page, index) => (
                <div
                  key={`page-${index}-${page.page}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {page.page}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {page.views.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No page data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topReferrers.length > 0 ? (
              stats.topReferrers.map((referrer, index) => (
                <div
                  key={`referrer-${index}-${referrer.source}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {referrer.source === "Direct"
                        ? "Direct Traffic"
                        : referrer.source}
                    </p>
                    <p className="text-xs text-gray-500">
                      {referrer.source === "Direct"
                        ? "No referrer"
                        : "External link"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {referrer.visits.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No referrer data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
