"use client";

import { useState } from "react";
import { authClient } from "@/modules/auth/lib/auth-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import { Loader2, UserPlus, Mail, Check } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

interface InviteMemberFormProps {
  organizationId: string;
}

export const InviteMemberForm = ({ organizationId }: InviteMemberFormProps) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: "Por favor, ingresa un email válido" });
      return;
    }

    if (!email.includes("@")) {
      setMessage({ type: "error", text: "Por favor, ingresa un email válido" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await authClient.organization.inviteMember({
        email: email.trim(),
        role,
        organizationId,
      });

      if (result.error) {
        setMessage({ type: "error", text: `Error: ${result.error.message}` });
      } else {
        setMessage({
          type: "success",
          text: `Invitación enviada exitosamente a ${email}`,
        });
        setEmail("");
        setRole("member");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invitar Nuevo Miembro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email del miembro</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "member") => setRole(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
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
            <Alert
              className={
                message.type === "success" ? "border-green-200 bg-green-50" : ""
              }
            >
              {message.type === "success" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription
                className={message.type === "success" ? "text-green-800" : ""}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Roles disponibles:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>
                <strong>Miembro:</strong> Puede ver sitios y estadísticas de la
                organización
              </li>
              <li>
                <strong>Administrador:</strong> Puede administrar la
                organización e invitar nuevos miembros
              </li>
            </ul>
            <p className="mt-2">
              El usuario recibirá un email con un enlace para aceptar la
              invitación.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
