import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserAccountData } from "@/modules/account/lib/services";
import { UserOrganizations } from "@/modules/account/components/user-organizations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Button } from "@repo/ui/components/button";
import { SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";

async function AccountContent() {
  const accountData = await getUserAccountData();

  if (!accountData) {
    redirect("/sign-in");
  }

  const { user, organizations } = accountData;

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and organizations
          </p>
        </div>
        <Button asChild>
          <Link href="/account/settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Account Settings
          </Link>
        </Button>
      </div>

      {/* User Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Account Information
          </CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Full Name
              </h3>
              <p className="text-lg">{user.name || "Not set"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Email Address
              </h3>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Organizations
              </h3>
              <p className="text-lg">{organizations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations */}
      <UserOrganizations organizations={organizations} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((key) => (
              <div key={key}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }, (_, i) => `org-skeleton-${i}`).map((key) => (
              <Skeleton key={key} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}
