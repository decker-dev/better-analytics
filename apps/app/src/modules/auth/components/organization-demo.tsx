"use client";

import { useState } from "react";
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
import { Loader2, Plus, Users, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

export default function OrganizationDemo() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [organizations, setOrganizations] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      role: string;
    }>
  >([]);

  // Create organization form
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  // Invite member form
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");

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
        setMessage("Organization created successfully!");
        setOrgName("");
        setOrgSlug("");
        await loadOrganizations();
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const result = await authClient.organization.listOrganizations();
      if (result.data) {
        setOrganizations(result.data);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedOrgId) {
      setMessage("Please select an organization and enter an email");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.organization.inviteMember({
        email: inviteEmail,
        role: "member",
        organizationId: selectedOrgId,
      });

      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Invitation sent successfully!");
        setInviteEmail("");
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadOrganizations} className="mb-4">
            Load Organizations
          </Button>

          {organizations.length > 0 ? (
            <div className="space-y-2">
              {organizations.map((org) => (
                <div key={org.id} className="p-3 border rounded-lg">
                  <h3 className="font-medium">{org.name}</h3>
                  <p className="text-sm text-gray-600">Slug: {org.slug}</p>
                  <p className="text-sm text-gray-600">Role: {org.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No organizations found. Create one above!
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-select">Select Organization</Label>
            <select
              id="org-select"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleInviteMember}
            disabled={loading || !inviteEmail || !selectedOrgId}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
