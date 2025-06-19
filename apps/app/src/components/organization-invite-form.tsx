"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/modules/auth/lib/auth-client";
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
import { Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface OrganizationInviteFormProps {
  currentUserRole?: string;
  organizationId: string;
}

export const OrganizationInviteForm = ({
  currentUserRole,
  organizationId,
}: OrganizationInviteFormProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const canInviteMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const handleInviteMember = async () => {
    if (!canInviteMembers) {
      setMessage("No tienes permisos para invitar miembros");
      return;
    }

    if (!inviteEmail.trim()) {
      setMessage("El email es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setMessage("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.organization.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Invitación enviada exitosamente");
        setInviteEmail("");
        setInviteRole("member");
        router.refresh();
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!canInviteMembers) {
    return (
      <Alert>
        <AlertDescription>
          No tienes permisos para invitar miembros a esta organización.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">Email del miembro</Label>
        <Input
          id="invite-email"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="miembro@ejemplo.com"
          disabled={loading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="invite-role">Rol</Label>
        <Select
          value={inviteRole}
          onValueChange={setInviteRole}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Miembro</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            {currentUserRole === "owner" && (
              <SelectItem value="owner">Propietario</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleInviteMember}
        disabled={loading || !inviteEmail.trim()}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Mail className="h-4 w-4 mr-2" />
        )}
        Enviar Invitación
      </Button>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
