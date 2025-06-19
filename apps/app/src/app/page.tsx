import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { User, Mail } from "lucide-react";
import Link from "next/link";
import OrganizationServer from "@/modules/auth/components/organization-server";
import { SignOutButton } from "@/modules/auth/components/sign-out-button";

export default async function HomePage() {
  // Get session on the server
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
              Sign in to access your analytics dashboard
            </p>
            <Link href="/sign-in">
              <button
                type="button"
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
              >
                Sign In
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
    redirect(`/${organizations[0]!.slug}/stats`);
  }

  // If no organizations, show organization creation page
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome to Better Analytics!
              </div>
              <SignOutButton />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{session.user.email}</span>
              </div>
              <p className="text-muted-foreground">
                You don't have any organizations yet. Create your first
                organization to get started.
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Create Your First Organization
          </h2>
          <OrganizationServer />
        </div>
      </div>
    </div>
  );
}
