import type { auth } from "@/modules/auth/lib/auth";

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];

export type Organization = typeof auth.$Infer.Organization;

export type Member = typeof auth.$Infer.Member;

export type Invitation = typeof auth.$Infer.Invitation;

export type FullOrganization = Organization & {
  members?: Member[];
};

export interface OrganizationSettingsProps {
  organization: Organization;
  members: Member[];
  invitations: Invitation[];
  currentUserRole: Member["role"];
  currentUserId: string;
} 