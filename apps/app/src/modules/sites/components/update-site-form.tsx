"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Save, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { updateSite } from "../actions/update-site";
import type { Site } from "@/modules/shared/lib/db/schema";
import type { ActionState } from "@/modules/shared/lib/middleware-action";

interface UpdateSiteFormProps {
  site: Site;
  orgSlug: string;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export const UpdateSiteForm = ({ site, orgSlug }: UpdateSiteFormProps) => {
  const [state, action, isPending] = useActionState(updateSite, initialState);

  return (
    <form action={action} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="siteId" value={site.id} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="currentSlug" value={site.slug} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Site Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={site.name}
            placeholder="Enter site name"
            maxLength={100}
            required
            aria-describedby="name-error name-help"
            className={state?.errors?.name ? "border-red-500" : ""}
            disabled={isPending}
          />
          <p id="name-help" className="text-xs text-muted-foreground">
            The URL slug will be automatically generated from the name
          </p>
          {state?.errors?.name && (
            <p id="name-error" className="text-sm text-red-500">
              {state.errors.name[0]}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-slug">Current URL Slug</Label>
          <Input
            id="current-slug"
            type="text"
            value={site.slug}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Read-only • Updates automatically with name changes
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          name="domain"
          type="text"
          defaultValue={site.domain || ""}
          placeholder="example.com"
          aria-describedby="domain-error domain-help"
          className={state?.errors?.domain ? "border-red-500" : ""}
          disabled={isPending}
        />
        <p id="domain-help" className="text-xs text-muted-foreground">
          Optional • Your site's domain name
        </p>
        {state?.errors?.domain && (
          <p id="domain-error" className="text-sm text-red-500">
            {state.errors.domain[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={site.description || ""}
          placeholder="Describe your site..."
          aria-describedby="description-error description-help"
          className={state?.errors?.description ? "border-red-500" : ""}
          disabled={isPending}
        />
        <p id="description-help" className="text-xs text-muted-foreground">
          Optional • A brief description of your site
        </p>
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          {state.success && <CheckCircle2 className="h-4 w-4" />}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
