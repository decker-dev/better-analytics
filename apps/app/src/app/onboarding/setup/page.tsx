"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export default function OnboardingSetupPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const setupAccount = async () => {
      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to setup account");
        }

        // Redirect to the appropriate page
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          setStatus("error");
          setError("Setup completed but no redirect URL provided");
        }
      } catch (error) {
        console.error("Setup error:", error);
        setStatus("error");
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );
      }
    };

    setupAccount();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Setup Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Setting up your account...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We're preparing your analytics dashboard. This should only take a
            moment.
          </p>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
