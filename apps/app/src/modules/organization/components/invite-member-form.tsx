"use client";

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
import { UserPlus, Mail, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { useInviteMember } from "../hooks/use-invite-member";

interface InviteMemberFormProps {
  organizationId: string;
}

export const InviteMemberForm = ({ organizationId }: InviteMemberFormProps) => {
  const { formRef, state, isPending, handleSubmit } =
    useInviteMember(organizationId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite New Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Member Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@company.com"
              required
              aria-describedby="email-error"
              className={state?.errors?.email ? "border-red-500" : ""}
              disabled={isPending}
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-red-500">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue="member" disabled={isPending}>
              <SelectTrigger aria-describedby="role-error">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.role && (
              <p id="role-error" className="text-sm text-red-500">
                {state.errors.role[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              {state.success && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              "Sending..."
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>

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
