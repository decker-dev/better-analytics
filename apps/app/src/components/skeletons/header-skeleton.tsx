import { Skeleton } from "@repo/ui/components/skeleton";

export const HeaderSkeleton = () => {
  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Skeleton className="h-8 w-8 md:hidden" />

          {/* Breadcrumb */}
          <Skeleton className="h-4 w-4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* User menu */}
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  );
};
