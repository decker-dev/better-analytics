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
            <p className="text-center text-gray-600">
              Sign in to access your analytics dashboard
            </p>
            <Link href="/sign-in">
              <button
                type="button"
                className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome back!
              </div>
              <SignOutButton />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{session.user.email}</span>
              </div>
              {session.user.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{session.user.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Organization Management</h2>
          <OrganizationServer />
        </div>
      </div>
    </div>
  );
}
