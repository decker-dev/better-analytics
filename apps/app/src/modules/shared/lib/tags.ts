/**
 * Centralized cache tags for revalidation.
 * @see https://nextjs.org/docs/app/building-your-application/caching/revalidating-data#on-demand-revalidation
 */
export const TAGS = {
  // Auth module
  SESSION: "session",
  ORGANIZATIONS: "organizations",
  ORGANIZATION: "organization",
  INVITATIONS: "invitations",
  AUTH_CACHE: "auth-cache", // A general tag for all auth-related cache
};
