"use client";

import {
  GalleryVerticalEnd,
  Github,
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { signIn } from "@/modules/auth/lib/auth-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        setMessage("Check your email! We've sent you a secure sign-in link.");
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

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    } catch (error) {
      setStatus("error");
      setMessage("Failed to sign in with GitHub");
      setGithubLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      setStatus("error");
      setMessage("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleMagicLinkSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Better Analytics</span>
            </Link>
            <h1 className="text-xl font-bold">Welcome to Better Analytics</h1>
            <div className="text-center text-sm text-muted-foreground">
              Sign in to your account or create a new one
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleMagicLinkSubmit(e);
                  }
                }}
              />
            </div>

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
              type="submit"
              className="w-full gap-2"
              disabled={loading || !email}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {loading ? "Sending..." : "Continue with Email"}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              className="w-full gap-2"
              onClick={handleGithubSignIn}
              disabled={githubLoading}
            >
              {githubLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Github size={16} />
              )}
              {githubLoading ? "Connecting..." : "Github"}
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full gap-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {googleLoading ? "Connecting..." : "Google"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
