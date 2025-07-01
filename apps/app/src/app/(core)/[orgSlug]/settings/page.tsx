import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getCachedSession,
  getCachedOrganizations,
  getCachedFullOrganization,
  getCachedInvitations,
} from "@/modules/auth/lib/auth-cache";
import { auth } from "@/modules/auth/lib/auth";
import { OrganizationSettings } from "@/modules/organization/components/organization-settings";
import {
  getOrganizationBySlug,
  formatOrganizationData,
} from "@/modules/organization/lib/services";
import type { Invitation } from "@/modules/organization/types/organization";

interface OrganizationSettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  const { orgSlug } = await params;

  // Middleware has already validated session and org access
  // We can safely get session and organizations (cached)
  const requestHeaders = await headers();
  const session = await getCachedSession(requestHeaders);
  const organizations = await getCachedOrganizations(requestHeaders);

  // Find the current organization (middleware guarantees it exists, but handle edge cases)
  let currentOrg = getOrganizationBySlug(organizations!, orgSlug);

  // If currentOrg is not found, this could be due to cache timing after a redirect
  // Try to fetch fresh data
  if (!currentOrg) {
    const freshOrganizations = await auth.api.listOrganizations({
      headers: requestHeaders,
    });
    currentOrg = getOrganizationBySlug(freshOrganizations!, orgSlug);

    if (!currentOrg) {
      // Organization truly doesn't exist or user doesn't have access
      notFound();
    }
  }

  // Get full organization details with members (cached)
  const fullOrganization = await getCachedFullOrganization(
    requestHeaders,
    currentOrg.id,
  );

  // Get pending invitations (cached)
  const invitations = await getCachedInvitations(requestHeaders, currentOrg.id);

  // Format data using organization service
  const organizationData = formatOrganizationData(
    fullOrganization!,
    (invitations || []) as Invitation[],
    session!.user.id,
  );

  return (
    <OrganizationSettings
      organization={organizationData.organization}
      members={organizationData.members}
      invitations={organizationData.invitations}
      currentUserRole={organizationData.currentUserRole}
      currentUserId={organizationData.currentUserId}
    />
  );
}
