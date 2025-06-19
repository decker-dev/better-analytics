"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/modules/auth/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { Loader2, Check, Mail, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface AcceptInvitationFormProps {
  invitationId: string;
  isSignedIn: boolean;
  userEmail?: string;
  invitationEmail: string;
  organizationSlug: string;
}

export const AcceptInvitationForm = ({
  invitationId,
  isSignedIn,
  userEmail,
  invitationEmail,
  organizationSlug,
}: AcceptInvitationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const router = useRouter();

  const handleAcceptInvitation = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        setMessage({ type: "error", text: `Error: ${result.error.message}` });
      } else {
        setMessage({
          type: "success",
          text: "¡Invitación aceptada exitosamente! Redirigiendo...",
        });

        // Redirect to the organization dashboard after a short delay
        setTimeout(() => {
          router.push(`/${organizationSlug}/sites`);
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    // Store the invitation ID to accept after sign in
    localStorage.setItem("pendingInvitation", invitationId);
    router.push(
      `/sign-in?redirectTo=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`,
    );
  };

  // Check if the signed-in user's email matches the invitation email
  const emailMismatch =
    isSignedIn && userEmail && userEmail !== invitationEmail;

  if (!isSignedIn) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Necesitas iniciar sesión para aceptar esta invitación.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Esta invitación fue enviada a: <strong>{invitationEmail}</strong>
          </p>
          <Button onClick={handleSignIn} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesión para Aceptar
          </Button>
        </div>
      </div>
    );
  }

  if (emailMismatch) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Esta invitación fue enviada a <strong>{invitationEmail}</strong>,
            pero estás conectado con <strong>{userEmail}</strong>.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Por favor, inicia sesión con la cuenta correcta o contacta al
            administrador.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/sign-in")}
            className="w-full"
          >
            Cambiar Cuenta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Conectado como: <strong>{userEmail}</strong>
        </p>
      </div>

      <Button
        onClick={handleAcceptInvitation}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Check className="h-4 w-4 mr-2" />
        )}
        Aceptar Invitación
      </Button>

      {message && (
        <Alert
          className={
            message.type === "success"
              ? "border-green-200 bg-green-50"
              : message.type === "info"
                ? "border-blue-200 bg-blue-50"
                : ""
          }
        >
          {message.type === "success" && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription
            className={
              message.type === "success"
                ? "text-green-800"
                : message.type === "info"
                  ? "text-blue-800"
                  : ""
            }
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Al aceptar esta invitación, te unirás a la organización con el rol
        especificado.
      </div>
    </div>
  );
};
