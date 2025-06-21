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

export const getCurrentUserRole = (members: Member[], userId: string): "owner" | "admin" | "member" | undefined => {
  return members.find(member => member.userId === userId)?.role;
};

export const canManageOrganization = (role: "owner" | "admin" | "member"): boolean => {
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
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    },
    members,
    invitations,
    currentUserRole: currentUserRole || "member" as const,
    currentUserId,
  };
}; 