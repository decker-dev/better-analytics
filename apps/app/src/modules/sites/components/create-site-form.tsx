"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

interface CreateSiteFormProps {
  orgSlug: string;
  organizationId: string;
}

export const CreateSiteForm = ({
  orgSlug,
  organizationId,
}: CreateSiteFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Site name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          name: formData.name.trim(),
          domain: formData.domain.trim() || undefined,
          description: formData.description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create site");
      }

      const site = await response.json();

      // Redirect to the sites list
      router.push(`/${orgSlug}/sites`);
    } catch (err) {
      console.error("Error creating site:", err);
      setError(err instanceof Error ? err.message : "Failed to create site");
    } finally {
      setLoading(false);
    }
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      if (error) {
        setError("");
      }
    };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${orgSlug}/sites`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Site</h1>
          <p className="text-muted-foreground">
            Add a new site to track analytics
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Site Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="My Awesome Website"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name for your site
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain (optional)</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={handleChange("domain")}
                placeholder="example.com"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                The domain where your site is hosted
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleChange("description")}
                placeholder="A brief description of your site..."
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Additional details about your site
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Link href={`/${orgSlug}/sites`}>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Site
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
