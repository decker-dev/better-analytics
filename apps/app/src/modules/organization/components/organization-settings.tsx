import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Settings, Users, Mail } from "lucide-react";
import { InviteMemberForm } from "@/modules/organization/components/invite-member-form";
import type { OrganizationSettingsProps } from "../types/organization";
import { UpdateOrganizationForm } from "./update-organization-form";

export const OrganizationSettings = ({
  organization,
  members,
  invitations,
  currentUserRole,
  currentUserId,
}: OrganizationSettingsProps) => {
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization settings, members, and invitations
        </p>
      </div>

      <div className="grid gap-6">
        {/* Organization Management */}
        {canManage ? (
          <UpdateOrganizationForm organization={organization} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Organization name
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {organization.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Identifier (slug)
                  </p>
                  <p className="mt-1 text-gray-600">{organization.slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Your role</p>
                  <span className="mt-1 inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {currentUserRole}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite Member Form - Only for admin and owner */}
        {canManage && <InviteMemberForm organizationId={organization.id} />}

        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                      {member.role}
                    </span>
                    {member.userId === currentUserId && (
                      <span className="text-xs text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {invitations && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Pending Invitations ({invitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited as {invitation.role} • {invitation.status}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-sm font-medium">
                      {invitation.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
