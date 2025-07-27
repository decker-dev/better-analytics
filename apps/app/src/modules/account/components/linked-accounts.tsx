"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  GithubIcon,
  ChromeIcon,
  MailIcon,
  CheckCircleIcon,
  PlusIcon,
} from "lucide-react";
import type { LinkedProvider } from "../types/account";
import { signIn } from "@/modules/auth/lib/auth-client";

interface LinkedAccountsProps {
  linkedProviders: LinkedProvider[];
}

const providerIcons: Record<string, React.ReactNode> = {
  github: <GithubIcon className="h-5 w-5" />,
  google: <ChromeIcon className="h-5 w-5" />,
  email: <MailIcon className="h-5 w-5" />,
  magicLink: <MailIcon className="h-5 w-5" />,
};

const availableProviders = [
  { id: "github", name: "GitHub", description: "Connect your GitHub account" },
  { id: "google", name: "Google", description: "Connect your Google account" },
];

export const LinkedAccounts = ({ linkedProviders }: LinkedAccountsProps) => {
  const linkedProviderIds = linkedProviders.map((p) => p.providerId);
  const unlinkedProviders = availableProviders.filter(
    (p) => !linkedProviderIds.includes(p.id),
  );

  const handleLinkAccount = async (providerId: string) => {
    try {
      await signIn.social({
        provider: providerId as "github" | "google",
        callbackURL: "/account/settings",
      });
    } catch (error) {
      console.error("Failed to link account:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage your connected authentication methods. You can sign in with any
          of these methods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked Accounts */}
        {linkedProviders.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Connected Accounts</h4>
            {linkedProviders.map((provider) => (
              <div
                key={`${provider.providerId}-${provider.accountId}`}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {providerIcons[provider.providerId] || (
                    <MailIcon className="h-5 w-5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {provider.providerName}
                      </span>
                      {provider.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected on {provider.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Only show unlink if user has more than one auth method */}
                {linkedProviders.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled // For now, disable unlinking for safety
                  >
                    Unlink
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Available Providers to Link */}
        {unlinkedProviders.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add More Sign-in Methods</h4>
            {unlinkedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 border rounded-lg border-dashed"
              >
                <div className="flex items-center space-x-3">
                  {providerIcons[provider.id]}
                  <div>
                    <span className="font-medium">{provider.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLinkAccount(provider.id)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}

        {linkedProviders.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <MailIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No connected accounts found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
