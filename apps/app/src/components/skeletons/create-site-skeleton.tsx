import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export const CreateSiteSkeleton = () => {
  const formFields = ["name", "domain", "description"];

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form fields */}
            {formFields.map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                {field === "description" ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <Skeleton className="h-10 w-full" />
                )}
                <Skeleton className="h-3 w-64" />
              </div>
            ))}

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
