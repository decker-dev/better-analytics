import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export const DashboardSkeleton = () => {
  const metrics = [
    "total-views",
    "unique-sessions",
    "avg-load-time",
    "bounce-rate",
  ];
  const sections = ["top-pages", "top-referrers"];
  const techSections = ["browsers", "operating-systems"];
  const sectionItems = ["item-1", "item-2", "item-3", "item-4", "item-5"];
  const techItems = ["tech-1", "tech-2", "tech-3", "tech-4"];
  const activityItems = [
    "activity-1",
    "activity-2",
    "activity-3",
    "activity-4",
    "activity-5",
    "activity-6",
  ];

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Key metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionItems.map((item) => (
                  <div
                    key={`${section}-${item}`}
                    className="flex items-center justify-between"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technology stats skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {techSections.map((tech) => (
          <Card key={tech}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {techItems.map((item) => (
                  <div
                    key={`${tech}-${item}`}
                    className="flex items-center justify-between"
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div
                key={item}
                className="flex items-start space-x-3 p-3 border rounded-lg bg-muted"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
