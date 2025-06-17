"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/modules/auth/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Loader2, Plus, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

export const OrganizationActions = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Create organization form
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  const handleCreateOrganization = async () => {
    if (!orgName || !orgSlug) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.organization.create({
        name: orgName,
        slug: orgSlug,
      });

      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Organization created successfully! Redirecting...");
        setOrgName("");
        setOrgSlug("");

        // Refresh the router cache and redirect to the new organization
        router.refresh();
        setTimeout(() => {
          router.push(`/${orgSlug}/stats`);
        }, 1000);
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="My Company"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-slug">Organization Slug</Label>
            <Input
              id="org-slug"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="my-company"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleCreateOrganization}
            disabled={loading || !orgName || !orgSlug}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Organization
          </Button>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
