"use client";

import { useActionState } from "react";
import { updateOrganization } from "../actions/update-organization";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Settings, CheckCircle2 } from "lucide-react";
import type { ActionState } from "@/modules/shared/lib/middleware-action";

type UpdateOrganizationFormProps = {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

const initialState: ActionState = {
  success: false,
  message: "",
};

export const UpdateOrganizationForm = ({
  organization,
}: UpdateOrganizationFormProps) => {
  const [state, action, isPending] = useActionState(
    updateOrganization,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Organization Settings
        </CardTitle>
        <CardDescription>
          Update your organization name and identifier (slug)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <input type="hidden" name="organizationId" value={organization.id} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={organization.name}
                placeholder="Enter organization name"
                required
                minLength={1}
                maxLength={100}
                aria-describedby="name-error"
                className={state?.errors?.name ? "border-red-500" : ""}
                disabled={isPending}
              />
              {state?.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identifier (Slug)</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={organization.slug}
                placeholder="organization-slug"
                required
                minLength={1}
                maxLength={50}
                pattern="^[a-z0-9-]+$"
                aria-describedby="slug-error slug-help"
                className={state?.errors?.slug ? "border-red-500" : ""}
                disabled={isPending}
              />
              <p id="slug-help" className="text-sm text-muted-foreground">
                Only lowercase letters, numbers, and hyphens are allowed
              </p>
              {state?.errors?.slug && (
                <p id="slug-error" className="text-sm text-red-500">
                  {state.errors.slug[0]}
                </p>
              )}
            </div>
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              {state.success && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Updating..." : "Update Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
