import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Link from "next/link";
import { Suspense } from "react";
import { AuthSkeleton } from "@/components/skeletons";

// Separate authenticated content for better Suspense handling
async function AuthenticatedContent() {
  // Get session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, show landing page
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Welcome to Better Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Sign in to start tracking your website analytics
            </p>
            <Link href="/sign-in">
              <button
                type="button"
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
              >
                Get Started
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // If user has organizations, redirect to the first one
  if (organizations && organizations.length > 0) {
    redirect(`/${organizations[0]!.slug}/sites`);
  }

  // If no organizations, redirect to onboarding setup
  redirect("/onboarding/setup");
}

export default async function HomePage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthenticatedContent />
    </Suspense>
  );
}
