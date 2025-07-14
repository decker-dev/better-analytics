"use client";

import { useState, useRef } from "react";
import { z } from "zod";
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
import { UserPlus, Mail, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface InviteMemberFormProps {
  organizationId: string;
}

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export const InviteMemberForm = ({ organizationId }: InviteMemberFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>({
    success: false,
    message: "",
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setState({ success: false, message: "", errors: {} });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    // Zod validation
    const validationResult = inviteSchema.safeParse({
      email: email?.trim(),
      role,
    });

    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      for (const error of validationResult.error.errors) {
        const path = error.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(error.message);
      }

      setState({
        success: false,
        message: "Please fix the validation errors",
        errors,
      });
      setIsPending(false);
      return;
    }

    try {
      // Use Better Auth client-side organization invitation
      const result = await authClient.organization.inviteMember({
        email: validationResult.data.email,
        role: validationResult.data.role,
        organizationId,
      });

      if (result.error) {
        setState({
          success: false,
          message: result.error.message || "Failed to send invitation",
          errors: {
            email: [result.error.message || "Failed to send invitation"],
          },
        });
      } else {
        setState({
          success: true,
          message: `Invitation sent successfully to ${validationResult.data.email}`,
        });
        // Reset form using ref
        formRef.current?.reset();
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      // Handle specific error cases
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("already invited")
      ) {
        setState({
          success: false,
          message: "User is already a member or has a pending invitation",
          errors: {
            email: ["User is already a member or has a pending invitation"],
          },
        });
      } else {
        setState({
          success: false,
          message: errorMessage,
          errors: { email: [errorMessage] },
        });
      }
    } finally {
      setIsPending(false);
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
