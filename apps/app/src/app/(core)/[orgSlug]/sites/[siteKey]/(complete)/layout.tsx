import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { getSiteByKey, verifySiteOwnership } from "@/lib/db/sites";
import { SiteNavigation } from "@/modules/sites/components/site-navigation";
import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; siteKey: string }>;
}

// Site navigation skeleton
function SiteNavigationSkeleton() {
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {["Analytics", "Settings"].map((item) => (
            <div key={item} className="flex items-center space-x-2 py-4 px-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Separate site validation and navigation for better Suspense handling
async function SiteContent({
  orgSlug,
  siteKey,
  children,
}: {
  orgSlug: string;
  siteKey: string;
  children: React.ReactNode;
}) {
  // Middleware has already validated session and org access
  // We only need to verify site ownership and get org details
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  // Verify that the site exists and belongs to this organization
  const isOwner = await verifySiteOwnership(siteKey, currentOrg.id);
  if (!isOwner) {
    notFound();
  }

  // Get site details
  const site = await getSiteByKey(siteKey);
  if (!site) {
    notFound();
  }

  return (
    <>
      {/* Site Navigation */}
      <SiteNavigation orgSlug={orgSlug} siteKey={siteKey} />

      {/* Main Content */}
      <main className="p-6">{children}</main>
    </>
  );
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { orgSlug, siteKey } = await params;
  const skeletonItems = ["metric-1", "metric-2", "metric-3", "metric-4"];

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen">
            <SiteNavigationSkeleton />
            <main className="p-6">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {skeletonItems.map((item) => (
                    <div key={item} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        }
      >
        <SiteContent orgSlug={orgSlug} siteKey={siteKey}>
          {children}
        </SiteContent>
      </Suspense>
    </div>
  );
}
