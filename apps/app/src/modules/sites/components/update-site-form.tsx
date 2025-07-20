"use client";

import { useActionState, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Save, CheckCircle2, Globe, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { updateSite } from "../actions/update-site";
import type { Site } from "@repo/database";
import type { ActionState } from "@/modules/shared/lib/middleware-action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

interface UpdateSiteFormProps {
  site: Site;
  orgSlug: string;
}

interface Domain {
  id: string;
  protocol: "http" | "https";
  host: string;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

// Parse existing domains from the site data
function parseDomainsFromSite(allowedDomains: string[] | null): Domain[] {
  if (!allowedDomains || allowedDomains.length === 0) {
    return [{ id: crypto.randomUUID(), protocol: "https", host: "" }];
  }

  return allowedDomains.map((domain) => {
    const id = crypto.randomUUID();

    // Check if domain has protocol
    if (domain.startsWith("http://")) {
      return {
        id,
        protocol: "http",
        host: domain.replace("http://", "").replace(/\/$/, ""),
      };
    }
    if (domain.startsWith("https://")) {
      return {
        id,
        protocol: "https",
        host: domain.replace("https://", "").replace(/\/$/, ""),
      };
    }
    // Default to https if no protocol specified
    return { id, protocol: "https", host: domain.replace(/\/$/, "") };
  });
}

// Convert domains back to the format expected by the server
function serializeDomains(domains: Domain[]): string {
  return domains
    .filter((domain) => domain.host.trim() !== "")
    .map((domain) => `${domain.protocol}://${domain.host.trim()}`)
    .join("\n");
}

// Validate and clean host input
function cleanHost(host: string): string {
  return host
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "") // Remove protocol if present
    .replace(/\/$/, "") // Remove trailing slash
    .replace(/[^a-z0-9.-]/g, ""); // Only allow alphanumeric, dots, and hyphens
}

export const UpdateSiteForm = ({ site, orgSlug }: UpdateSiteFormProps) => {
  const [state, action, isPending] = useActionState(updateSite, initialState);
  const [domains, setDomains] = useState<Domain[]>(() =>
    parseDomainsFromSite(site.allowedDomains),
  );

  const handleAddDomain = () => {
    setDomains((prev) => [
      ...prev,
      { id: crypto.randomUUID(), protocol: "https", host: "" },
    ]);
  };

  const handleRemoveDomain = (id: string) => {
    setDomains((prev) => prev.filter((domain) => domain.id !== id));
  };

  const handleProtocolChange = (id: string, protocol: "http" | "https") => {
    setDomains((prev) =>
      prev.map((domain) =>
        domain.id === id ? { ...domain, protocol } : domain,
      ),
    );
  };

  const handleHostChange = (id: string, host: string) => {
    const cleanedHost = cleanHost(host);
    setDomains((prev) =>
      prev.map((domain) =>
        domain.id === id ? { ...domain, host: cleanedHost } : domain,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Site Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          {/* Hidden fields */}
          <input type="hidden" name="siteId" value={site.id} />
          <input type="hidden" name="orgSlug" value={orgSlug} />
          <input type="hidden" name="currentSlug" value={site.slug} />
          <input
            type="hidden"
            name="allowedDomains"
            value={serializeDomains(domains)}
          />

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

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="domainProtection"
                name="domainProtection"
                defaultChecked={site.domainProtection || false}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isPending}
              />
              <Label htmlFor="domainProtection" className="text-sm font-medium">
                Enable domain protection
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, only events from specified domains will be accepted
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Allowed Domains</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDomain}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Protocol</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain, index) => (
                      <TableRow key={domain.id}>
                        <TableCell>
                          <Select
                            value={domain.protocol}
                            onValueChange={(value: "http" | "https") =>
                              handleProtocolChange(domain.id, value)
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="https">https://</SelectItem>
                              <SelectItem value="http">http://</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={domain.host}
                            onChange={(e) =>
                              handleHostChange(domain.id, e.target.value)
                            }
                            placeholder="example.com"
                            disabled={isPending}
                            className="font-mono text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDomain(domain.id)}
                            disabled={isPending || domains.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">
                Only used when domain protection is enabled • Each domain should
                be clean (no trailing slashes)
              </p>
              {state?.errors?.allowedDomains && (
                <p className="text-sm text-red-500">
                  {state.errors.allowedDomains[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="text"
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
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
