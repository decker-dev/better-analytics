import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export const SiteListSkeleton = () => {
  const siteItems = ["site-1", "site-2", "site-3", "site-4", "site-5"];

  return (
    <div className="p-6 space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Sites grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {siteItems.map((site) => (
          <Card key={site} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="pt-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state skeleton (alternative) */}
      <Card className="text-center py-12">
        <CardContent>
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto mb-4" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
};
