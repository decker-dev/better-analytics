"use client";

import { BoltIcon, LogOutIcon, UserIcon, BuildingIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import Link from "next/link";
import { useSession, signOut } from "@/modules/auth/lib/auth-client";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

export default function UserMenu() {
  const { data: session, isPending } = useSession();
  const params = useParams();
  const orgSlug = params?.orgSlug as string;

  const handleLogoutClick = () => {
    signOut();
    redirect("/sign-in");
  };

  // Don't render if session is loading or user is not authenticated
  if (isPending || !session?.user) {
    return null;
  }

  const user = session.user;

  // Safely calculate initials
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

  const initials = getInitials();
  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={userImage} alt="Profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64" align="end">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {userName}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {userEmail}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/account">
            <DropdownMenuItem>
              <UserIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Account</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/account/settings">
            <DropdownMenuItem>
              <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Account Settings</span>
            </DropdownMenuItem>
          </Link>
          {orgSlug && (
            <Link href={`/${orgSlug}/settings`}>
              <DropdownMenuItem>
                <BuildingIcon size={16} className="opacity-60" aria-hidden="true" />
                <span>Organization Settings</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
