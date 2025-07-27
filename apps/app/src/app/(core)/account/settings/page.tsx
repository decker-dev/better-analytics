import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserAccountData } from "@/modules/account/lib/services";
import { ProfileSettings } from "@/modules/account/components/profile-settings";
import { LinkedAccounts } from "@/modules/account/components/linked-accounts";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

async function AccountSettingsContent() {
  const accountData = await getUserAccountData();

  if (!accountData) {
    redirect("/sign-in");
  }

  const { user, linkedProviders } = accountData;

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/account">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Account
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and authentication settings
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Profile Settings */}
        <ProfileSettings user={user} />

        {/* Linked Accounts */}
        <LinkedAccounts linkedProviders={linkedProviders} />

        {/* Security Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Security</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account security and privacy settings.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-muted rounded-lg">
              <h4 className="font-medium mb-2">Account Creation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your account was created using Better Auth, which provides
                secure authentication and password management.
              </p>
              <div className="text-sm text-muted-foreground">
                <strong>Account ID:</strong> {user.id}
              </div>
            </div>

            <div className="p-4 border border-muted rounded-lg">
              <h4 className="font-medium mb-2">Session Management</h4>
              <p className="text-sm text-muted-foreground">
                Your sessions are automatically managed by Better Auth. Sessions
                expire after a period of inactivity for your security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-32" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div>

      <div className="grid gap-6">
        {Array.from({ length: 3 }, (_, i) => `settings-card-${i}`).map(
          (key) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AccountSettingsContent />
    </Suspense>
  );
}
