"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import {
  BuildingIcon,
  SettingsIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";

interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: Date;
}

interface UserOrganizationsProps {
  organizations: UserOrganization[];
}

const getRoleBadgeVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    case "member":
      return "outline";
    default:
      return "outline";
  }
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export const UserOrganizations = ({
  organizations,
}: UserOrganizationsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          Organizations you're a member of. Create or join organizations to
          collaborate with your team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {organizations.length > 0 ? (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <BuildingIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{org.name}</h3>
                      <Badge variant={getRoleBadgeVariant(org.role)}>
                        {formatRole(org.role)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {org.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${org.slug}`}>
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      Open
                    </Link>
                  </Button>

                  {(org.role === "owner" || org.role === "admin") && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${org.slug}/settings`}>
                        <SettingsIcon className="h-4 w-4 mr-1" />
                        Settings
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BuildingIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Organizations</h3>
            <p className="text-muted-foreground mb-4">
              You're not a member of any organizations yet.
            </p>
            <Button asChild>
              <Link href="/setup">
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Organization
              </Link>
            </Button>
          </div>
        )}

        {organizations.length > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/setup">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Organization
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
