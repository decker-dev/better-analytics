import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/modules/auth/lib/auth";
import { OrgSwitcher } from "@/modules/auth/components/org-switcher";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;

  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/sign-in");
  }

  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the requested organization
  const currentOrg = organizations?.find((org) => org.slug === orgSlug);

  // If organization doesn't exist or user doesn't have access
  if (!currentOrg) {
    notFound();
  }

  // Set active organization
  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: {
      organizationId: currentOrg.id,
    },
  });

  return (
    <div className="min-h-screen">
      {/* Organization Header */}
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">{currentOrg.name}</h1>
              <span className="text-sm text-muted-foreground">/{orgSlug}</span>
            </div>

            {/* Organization Switcher */}
            <div className="flex items-center space-x-4">
              <OrgSwitcher
                organizations={organizations || []}
                currentOrgSlug={orgSlug}
              />

              <div className="text-sm text-muted-foreground">
                {session.user.email}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
