import "server-only";

import { unstable_cache } from "@/lib/unstable-cache";
import { auth } from "@/modules/auth/lib/auth";
import { TAGS } from "@/lib/tags";

/**
 * Cached session getter - reduces database calls for session verification
 * Cache duration: 15 minutes
 */
export async function getCachedSession(headers: Headers) {
  const sessionCookie = headers.get("cookie") ?? "";
  return await unstable_cache(
    () => auth.api.getSession({ headers }),
    [TAGS.SESSION, TAGS.AUTH_CACHE, sessionCookie],
    {
      revalidate: 900,
      tags: [TAGS.SESSION, TAGS.AUTH_CACHE],
    },
  )();
}

/**
 * Cached organizations list - reduces database calls for organization data
 * Cache duration: 15 minutes
 */
export async function getCachedOrganizations(headers: Headers) {
  const sessionCookie = headers.get("cookie") ?? "";
  return await unstable_cache(
    () => auth.api.listOrganizations({ headers }),
    [TAGS.ORGANIZATIONS, TAGS.AUTH_CACHE, sessionCookie],
    {
      revalidate: 900,
      tags: [TAGS.ORGANIZATIONS, TAGS.AUTH_CACHE],
    },
  )();
}

/**
 * Cached organization details with members - for organization settings pages
 * Cache duration: 15 minutes
 */
export async function getCachedFullOrganization(headers: Headers, organizationId: string) {
  const sessionCookie = headers.get("cookie") ?? "";
  return await unstable_cache(
    () =>
      auth.api.getFullOrganization({
        headers,
        query: { organizationId },
      }),
    [TAGS.ORGANIZATION, TAGS.AUTH_CACHE, sessionCookie, organizationId],
    {
      revalidate: 900,
      tags: [TAGS.ORGANIZATION, TAGS.AUTH_CACHE],
    },
  )();
}

/**
 * Cached invitations list - for organization settings pages
 * Cache duration: 15 minutes
 */
export async function getCachedInvitations(headers: Headers, organizationId: string) {
  const sessionCookie = headers.get("cookie") ?? "";
  return await unstable_cache(
    () =>
      auth.api.listInvitations({
        headers,
        query: { organizationId },
      }),
    [TAGS.INVITATIONS, TAGS.AUTH_CACHE, sessionCookie, organizationId],
    {
      revalidate: 900,
      tags: [TAGS.INVITATIONS, TAGS.AUTH_CACHE],
    },
  )();
} 