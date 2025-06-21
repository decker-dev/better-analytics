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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Loader2, UserPlus, Mail, Check } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface InviteMemberFormProps {
  organizationId: string;
}

export const InviteMemberForm = ({ organizationId }: InviteMemberFormProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter a valid email" });
      return;
    }

    if (!email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authClient.organization.inviteMember({
        email: email.trim(),
        role,
        organizationId,
      });

      if (result.error) {
        setMessage({ type: "error", text: `Error: ${result.error.message}` });
      } else {
        setMessage({
          type: "success",
          text: `Invitation sent successfully to ${email}`,
        });
        setEmail("");
        setRole("member");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite New Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Member email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "member") => setRole(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Send Invitation
          </Button>

          {message && (
            <Alert
              className={
                message.type === "success" ? "border-green-200 bg-green-50" : ""
              }
            >
              {message.type === "success" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription
                className={message.type === "success" ? "text-green-800" : ""}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Available roles:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Member:</strong> Can view sites and analytics for the
                organization
              </li>
              <li>
                <strong>Admin:</strong> Can manage the organization and invite
                new members
              </li>
            </ul>
            <p className="mt-2">
              The user will receive an email with a link to accept the
              invitation.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
