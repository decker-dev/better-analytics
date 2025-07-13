import { db, schema } from '@/modules/shared/lib/db';
import type { Site } from '@/modules/shared/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get all sites for an organization
 */
export async function getSitesByOrg(organizationId: string): Promise<Site[]> {
  return await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.organizationId, organizationId))
    .orderBy(schema.sites.createdAt);
}

/**
 * Get a site by its slug within an organization
 */
export async function getSiteBySlug(
  slug: string,
  organizationId: string
): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(schema.sites)
    .where(
      and(
        eq(schema.sites.slug, slug),
        eq(schema.sites.organizationId, organizationId)
      )
    )
    .limit(1);

  return site || null;
}

/**
 * Check if a site belongs to an organization (by slug)
 */
export async function verifySiteOwnershipBySlug(
  slug: string,
  organizationId: string
): Promise<boolean> {
  const site = await getSiteBySlug(slug, organizationId);
  return !!site;
} 