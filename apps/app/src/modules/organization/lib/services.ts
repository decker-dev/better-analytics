import type {
  Organization,
  Member,
  Invitation,
  FullOrganization
} from "../types/organization";

export const getOrganizationById = (organizations: Organization[], orgId: string): Organization | undefined => {
  return organizations.find(org => org.id === orgId);
};

export const getOrganizationBySlug = (organizations: Organization[], slug: string): Organization | undefined => {
  return organizations.find(org => org.slug === slug);
};

export const getCurrentUserRole = (members: Member[], userId: string): Member["role"] | undefined => {
  return members.find(member => member.userId === userId)?.role;
};

export const canManageOrganization = (role: Member["role"]): boolean => {
  return role === "owner" || role === "admin";
};

export const formatOrganizationData = (
  organization: FullOrganization,
  invitations: Invitation[],
  currentUserId: string
) => {
  const members = organization.members || [];
  const currentUserRole = getCurrentUserRole(members, currentUserId);

  return {
    organization,
    members,
    invitations,
    currentUserRole: currentUserRole || "member" as const,
    currentUserId,
  };
}; 