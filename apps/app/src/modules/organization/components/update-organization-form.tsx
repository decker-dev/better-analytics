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
        <CardDescription>Update your organization name.</CardDescription>
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
