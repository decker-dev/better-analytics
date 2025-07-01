"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Loader2 } from "lucide-react";
import { updateOrganization } from "../actions/update-organization";
import type { Organization } from "../types/organization";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric characters except hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

interface UpdateOrganizationFormProps {
  organization: Organization;
}

export function UpdateOrganizationForm({
  organization,
}: UpdateOrganizationFormProps) {
  const [name, setName] = useState(organization.name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const derivedSlug = useMemo(() => {
    if (name === organization.name) {
      return organization.slug;
    }
    return generateSlug(name);
  }, [name, organization.name, organization.slug]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name === organization.name) return;

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("organizationId", organization.id);
      formData.append("name", name);
      formData.append("slug", derivedSlug);

      const result = await updateOrganization(formData);

      if (result?.error) {
        setError(result.error);
        setSuccess(null);
      } else {
        setSuccess("Organization updated successfully!");
        setError(null);
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Organization Name</CardTitle>
          <CardDescription>
            Updating the name will also update the organization's URL. Make sure
            the new URL doesn't conflict with existing organizations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear messages when user starts typing
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center mt-4">
          <div className="flex-1 mr-4">
            {error && (
              <div className="text-sm text-destructive space-y-1">
                <p className="font-medium">Unable to update organization:</p>
                <p>{error}</p>
                {error.includes("slug") && error.includes("already in use") && (
                  <p className="text-xs text-muted-foreground">
                    Try choosing a different name or manually edit the URL slug.
                  </p>
                )}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600">
                <p className="font-medium">✓ {success}</p>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending || name === organization.name}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Updating..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
