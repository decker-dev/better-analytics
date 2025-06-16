"use client";

import { signOut } from "@/modules/auth/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { LogOut } from "lucide-react";

export const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
};
