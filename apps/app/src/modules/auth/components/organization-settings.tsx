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
import { Loader2, Save, Mail, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface OrganizationSettingsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    members?: Array<{
      id: string;
      userId: string;
      role: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  } | null;
  currentUserRole?: string;
  showInviteForm?: boolean;
}

export const OrganizationSettings = ({
  organization,
  currentUserRole,
  showInviteForm = false,
}: OrganizationSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Organization update form
  const [orgName, setOrgName] = useState(organization?.name || "");
  const [orgSlug, setOrgSlug] = useState(organization?.slug || "");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const canEditOrganization =
    currentUserRole === "owner" || currentUserRole === "admin";
  const canInviteMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const handleUpdateOrganization = async () => {
    if (!canEditOrganization) {
      setMessage("No tienes permisos para editar la organización");
      return;
    }

    if (!orgName.trim()) {
      setMessage("El nombre de la organización es requerido");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.organization.update({
        data: {
          name: orgName.trim(),
          slug: orgSlug.trim() || undefined,
        },
        organizationId: organization?.id,
      });

      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Organización actualizada exitosamente");
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

  const handleInviteMember = async () => {
    if (!canInviteMembers) {
      setInviteMessage("No tienes permisos para invitar miembros");
      return;
    }

    if (!inviteEmail.trim()) {
      setInviteMessage("El email es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteMessage("Por favor ingresa un email válido");
      return;
    }

    setInviteLoading(true);
    try {
      const result = await authClient.organization.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole as "member" | "owner" | "admin",
      });

      if (result.error) {
        setInviteMessage(`Error: ${result.error.message}`);
      } else {
        setInviteMessage("Invitación enviada exitosamente");
        setInviteEmail("");
        setInviteRole("member");
        router.refresh();
      }
    } catch (error) {
      setInviteMessage(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (currentUserRole !== "owner") {
      setMessage("Solo el propietario puede eliminar la organización");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar esta organización? Esta acción no se puede deshacer.",
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const result = await authClient.organization.delete({
        organizationId: organization?.id || "",
      });

      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Organización eliminada exitosamente. Redirigiendo...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (showInviteForm) {
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
            disabled={inviteLoading || !canInviteMembers}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="invite-role">Rol</Label>
          <Select
            value={inviteRole}
            onValueChange={setInviteRole}
            disabled={inviteLoading || !canInviteMembers}
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
          disabled={inviteLoading || !inviteEmail.trim() || !canInviteMembers}
          className="w-full"
        >
          {inviteLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Enviar Invitación
        </Button>

        {!canInviteMembers && (
          <Alert>
            <AlertDescription>
              No tienes permisos para invitar miembros a esta organización.
            </AlertDescription>
          </Alert>
        )}

        {inviteMessage && (
          <Alert>
            <AlertDescription>{inviteMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="org-name">Nombre de la organización</Label>
          <Input
            id="org-name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Mi Organización"
            disabled={loading || !canEditOrganization}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="org-slug">Identificador (slug)</Label>
          <Input
            id="org-slug"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            placeholder="mi-organizacion"
            disabled={loading || !canEditOrganization}
          />
          <p className="text-sm text-muted-foreground">
            Este identificador se usa en la URL de tu organización
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdateOrganization}
            disabled={loading || !orgName.trim() || !canEditOrganization}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>

          {currentUserRole === "owner" && (
            <Button
              onClick={handleDeleteOrganization}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!canEditOrganization && (
          <Alert>
            <AlertDescription>
              No tienes permisos para editar esta organización. Solo los
              propietarios y administradores pueden hacer cambios.
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
