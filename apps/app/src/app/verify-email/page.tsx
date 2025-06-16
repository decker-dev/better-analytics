"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/modules/auth/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("No verification token found in URL");
          return;
        }

        // Verify the magic link
        const { data, error } = await authClient.magicLink.verify({
          token,
        });

        if (error) {
          setStatus("error");
          setMessage(error.message || "Verification failed");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! You are now signed in.");

        // Redirect to home page after a delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }
    };

    handleVerification();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            {status === "error" && <XCircle className="h-6 w-6 text-red-500" />}
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && message}
            {status === "error" && message}
          </p>
          {status === "success" && (
            <p className="text-xs text-gray-500 mt-2">
              Redirecting you to the homepage...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
