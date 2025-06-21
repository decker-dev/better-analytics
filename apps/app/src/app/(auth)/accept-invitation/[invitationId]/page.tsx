import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { UserPlus } from "lucide-react";
import { AcceptInvitationForm } from "@/modules/organization/components/accept-invitation-form";

interface AcceptInvitationPageProps {
  params: Promise<{ invitationId: string }>;
}

export default async function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { invitationId } = await params;

  // Get the invitation details
  let invitation = null;
  try {
    invitation = await auth.api.getInvitation({
      headers: await headers(),
      query: { id: invitationId },
    });
  } catch (error) {
    // Invitation not found or invalid
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <UserPlus className="h-5 w-5" />
              Invitación No Válida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Esta invitación no es válida o ha expirado.
              </p>
              <p className="text-sm text-muted-foreground">
                Si crees que esto es un error, contacta a la persona que te
                envió la invitación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <UserPlus className="h-5 w-5" />
              Invitación No Encontrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                No se pudo encontrar la invitación.
              </p>
              <p className="text-sm text-muted-foreground">
                El enlace puede haber expirado o ser inválido.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is already signed in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitación a Organización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {invitation.organizationName}
              </h3>
              <p className="text-muted-foreground">
                Has sido invitado a unirte como{" "}
                <strong>{invitation.role}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Invitado por: {invitation.inviterEmail}
              </p>
            </div>

            <AcceptInvitationForm
              invitationId={invitationId}
              isSignedIn={!!session}
              userEmail={session?.user?.email}
              invitationEmail={invitation.email}
              organizationSlug={invitation.organizationSlug}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
