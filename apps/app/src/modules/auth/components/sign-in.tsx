"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { useState } from "react";
import { Loader2, Key, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { signIn } from "@/modules/auth/lib/auth-client";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMagicLinkSubmit = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await signIn.magicLink(
        {
          email,
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
        },
      );

      if (result.error) {
        setStatus("error");
        setMessage(result.error.message || "Failed to send magic link");
      } else {
        setStatus("success");
        setMessage(
          "Magic link sent! Check your email and click the link to sign in.",
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Sign In
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to receive a magic link to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") {
                  setStatus("idle");
                  setMessage("");
                }
              }}
              value={email}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMagicLinkSubmit();
                }
              }}
            />

            {status !== "idle" && (
              <Alert
                className={cn(
                  status === "success" &&
                    "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
                  status === "error" &&
                    "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
                )}
              >
                <div className="flex items-center gap-2">
                  {status === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={cn(
                      status === "success" &&
                        "text-green-800 dark:text-green-200",
                      status === "error" && "text-red-800 dark:text-red-200",
                    )}
                  >
                    {message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button
              disabled={loading || !email}
              className="gap-2"
              onClick={handleMagicLinkSubmit}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </CardFooter>
    </Card>
  );
}
