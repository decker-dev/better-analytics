import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export const SettingsSkeleton = () => {
  const inputFields = ["name", "domain", "description"];
  const siteKeyItems = ["current-key", "regenerate"];
  const integrationSections = ["javascript", "react", "nextjs"];

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Site Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.slice(0, 2).map((field) => (
              <div key={field}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Site Key Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {siteKeyItems.map((item) => (
            <div key={item} className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              {item === "current-key" ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <Skeleton className="h-8 w-20" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Integration Code Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-64 mb-3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-3 w-80" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
