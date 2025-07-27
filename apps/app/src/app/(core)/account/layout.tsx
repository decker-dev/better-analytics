import { Suspense } from "react";
import { Button } from "@repo/ui/components/button";
import { UserIcon, SettingsIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import { redirect } from "next/navigation";

interface AccountLayoutProps {
  children: React.ReactNode;
}

async function AccountLayoutContent({ children }: AccountLayoutProps) {
  // Verify user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <div className="border-b bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to App
                </Link>
              </Button>
              <div className="h-4 w-px bg-border" />
              <nav className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account" className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Account
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account/settings" className="flex items-center">
                    <SettingsIcon className="h-4 w-4 mr-1" />
                    Settings
                  </Link>
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">{children}</main>
    </div>
  );
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading account...
            </p>
          </div>
        </div>
      }
    >
      <AccountLayoutContent>{children}</AccountLayoutContent>
    </Suspense>
  );
}
