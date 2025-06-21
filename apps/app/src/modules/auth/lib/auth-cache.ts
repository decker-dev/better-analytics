import { auth } from "@/modules/auth/lib/auth";

/**
 * Cached session getter - reduces database calls for session verification
 * Cache duration: 15 minutes (default)
 */
export async function getCachedSession(headers: Headers) {
  "use cache";
  return await auth.api.getSession({ headers });
}

/**
 * Cached organizations list - reduces database calls for organization data
 * Cache duration: 15 minutes (default)
 */
export async function getCachedOrganizations(headers: Headers) {
  "use cache";
  return await auth.api.listOrganizations({ headers });
}

/**
 * Cached organization details with members - for organization settings pages
 * Cache duration: 15 minutes (default)
 */
export async function getCachedFullOrganization(headers: Headers, organizationId: string) {
  "use cache";
  return await auth.api.getFullOrganization({
    headers,
    query: { organizationId },
  });
}

/**
 * Cached invitations list - for organization settings pages
 * Cache duration: 15 minutes (default)
 */
export async function getCachedInvitations(headers: Headers, organizationId: string) {
  "use cache";
  return await auth.api.listInvitations({
    headers,
    query: { organizationId },
  });
} 