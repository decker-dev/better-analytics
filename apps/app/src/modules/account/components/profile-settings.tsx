"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { CheckCircle2 } from "lucide-react";
import { updateProfile } from "../actions/update-profile";
import type { User } from "../types/account";
import type { ActionState } from "@/modules/shared/lib/middleware-action";

interface ProfileSettingsProps {
  user: User;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const [state, action, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.image || ""} alt="Profile image" />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Profile pictures are managed through your authentication provider.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user?.name || ""}
              placeholder="Enter your full name"
              required
              minLength={1}
              maxLength={50}
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              placeholder="Enter your email address"
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed through profile settings. Use your
              authentication provider to update your email.
            </p>
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              {state.success && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
