import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Users } from "lucide-react";
import { OrganizationActions } from "./organization-actions";

export default async function OrganizationServer() {
  // Load organizations on the server
  let organizations: Array<{
    id: string;
    name: string;
    slug: string;
  }> = [];

  try {
    const result = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (result) {
      organizations = result.map(
        (org: {
          id: string;
          name: string;
          slug: string;
        }) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
        }),
      );
    }
  } catch (error) {
    console.error("Failed to load organizations:", error);
  }

  return (
    <div className="space-y-6">
      {/* Client component for interactive actions */}
      <OrganizationActions />

      {/* Server-rendered organizations list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Organizations ({organizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length > 0 ? (
            <div className="space-y-2">
              {organizations.map((org) => (
                <div key={org.id} className="p-3 border rounded-lg">
                  <h3 className="font-medium">{org.name}</h3>
                  <p className="text-sm text-gray-600">Slug: {org.slug}</p>
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
    </div>
  );
}
