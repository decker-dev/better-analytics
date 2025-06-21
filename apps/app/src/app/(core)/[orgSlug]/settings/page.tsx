import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Settings, Users, Mail, UserPlus } from "lucide-react";
import { InviteMemberForm } from "@/modules/auth/components/invite-member-form";

interface OrganizationSettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  const { orgSlug } = await params;

  // Middleware has already validated session and org access
  // We can safely get session and organizations
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Find the current organization (middleware guarantees it exists)
  const currentOrg = organizations?.find((org) => org.slug === orgSlug)!;

  // Get full organization details with members
  const fullOrganization = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId: currentOrg.id },
  });

  // Get pending invitations
  const invitations = await auth.api.listInvitations({
    headers: await headers(),
    query: { organizationId: currentOrg.id },
  });

  const currentUserRole = fullOrganization?.members?.find(
    (m) => m.userId === session!.user.id,
  )?.role;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Organización</h1>
        <p className="text-muted-foreground mt-2">
          Administra la configuración de tu organización, miembros e
          invitaciones
        </p>
      </div>

      <div className="grid gap-6">
        {/* Organization Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Nombre de la organización
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {fullOrganization?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Identificador (slug)
                </p>
                <p className="mt-1 text-gray-600">{fullOrganization?.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Tu rol</p>
                <span className="mt-1 inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentUserRole}
                </span>
              </div>
              {(currentUserRole === "owner" || currentUserRole === "admin") && (
                <p className="text-sm text-muted-foreground">
                  Como {currentUserRole}, puedes administrar esta organización e
                  invitar nuevos miembros.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invite Member Form - Only for admin and owner */}
        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <InviteMemberForm organizationId={currentOrg.id} />
        )}

        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Miembros ({fullOrganization?.members?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fullOrganization?.members?.map((member) => (
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
                    {member.userId === session!.user.id && (
                      <span className="text-xs text-muted-foreground">
                        (Tú)
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
                Invitaciones Pendientes ({invitations.length})
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
                          Invitado como {invitation.role} • {invitation.status}
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
}
