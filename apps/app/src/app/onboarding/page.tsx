import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { createFirstOrganizationAndSite } from "@/modules/onboarding/actions/create-first-setup";

export default async function OnboardingPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect("/sign-in");
  }

  // Check if user already has organizations
  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  if (organizations && organizations.length > 0) {
    // User already has organizations, redirect to first one
    redirect(`/${organizations[0]?.slug}/sites`);
  }

  // Create organization and site automatically
  const result = await createFirstOrganizationAndSite();

  if (result.success && result.data) {
    redirect(
      `/${result.data.organizationSlug}/sites/${result.data.siteKey}/onboarding`,
    );
  }

  // Fallback UI in case of errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Setting up your workspace...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're creating your first organization and site.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </div>
    </div>
  );
}
