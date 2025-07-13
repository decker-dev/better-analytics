"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Form from "next/form";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Loader2, Save } from "lucide-react";
import { updateSiteAction } from "../actions/update-site";
import type { Site } from "@/lib/db/schema";
import { useEffect } from "react";

interface UpdateSiteFormProps {
  site: Site;
  orgSlug: string;
}

export const UpdateSiteForm = ({ site, orgSlug }: UpdateSiteFormProps) => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSiteAction, null);

  useEffect(() => {
    if (state?.data?.slug && state.data.slug !== site.slug) {
      // If slug changed, redirect to new URL
      router.push(`/${orgSlug}/sites/${state.data.slug}/settings`);
    }
  }, [state, router, orgSlug, site.slug]);

  return (
    <Form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      <input type="hidden" name="siteId" value={site.id} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="currentSlug" value={site.slug} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Site Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={site.name}
            placeholder="Enter site name"
            maxLength={100}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            The URL slug will be automatically generated from the name
          </p>
        </div>
        <div>
          <Label htmlFor="current-slug">Current URL Slug</Label>
          <Input
            id="current-slug"
            type="text"
            value={site.slug}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Read-only • Updates automatically with name changes
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          name="domain"
          type="text"
          defaultValue={site.domain || ""}
          placeholder="example.com"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional • Your site's domain name
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={site.description || ""}
          placeholder="Describe your site..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional • A brief description of your site
        </p>
      </div>

      {/* Error handling */}
      {state?.validationErrors && (
        <div className="text-sm text-red-600">
          {Object.entries(state.validationErrors).map(([field, errors]) => (
            <div key={field}>
              <strong>{field}:</strong> {errors.join(", ")}
            </div>
          ))}
        </div>
      )}

      {state?.serverError && (
        <div className="text-sm text-red-600">{state.serverError}</div>
      )}

      {state?.success && (
        <div className="text-sm text-green-600">Site updated successfully!</div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </Form>
  );
};
