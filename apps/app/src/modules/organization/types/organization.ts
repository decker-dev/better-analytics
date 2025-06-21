import type { auth } from "@/modules/auth/lib/auth";

// Inferir tipos directamente de Better Auth usando $Infer
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

// Tipos inferidos para organization plugin de Better Auth
export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

export type Invitation = {
  id: string;
  email: string;
  inviterId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type FullOrganization = Organization & {
  members?: Member[];
};

// Props types para componentes
export interface OrganizationSettingsProps {
  organization: Organization;
  members: Member[];
  invitations: Invitation[];
  currentUserRole: "owner" | "admin" | "member";
  currentUserId: string;
} 