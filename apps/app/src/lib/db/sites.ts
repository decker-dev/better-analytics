import { db, schema } from './index';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { generateUniqueSiteKey } from '../site-key';
import type { NewSite, Site } from './schema';

/**
 * Create a new site for an organization
 */
export async function createSite(
  organizationId: string,
  name: string,
  domain?: string,
  description?: string,
  customSiteKey?: string
): Promise<Site> {
  const id = nanoid();
  const siteKey = customSiteKey || await generateUniqueSiteKey(organizationId);

  const newSite: NewSite = {
    id,
    name,
    siteKey,
    organizationId,
    domain: domain || null,
    description: description || null,
  };

  const [site] = await db.insert(schema.sites).values(newSite).returning();

  if (!site) {
    throw new Error('Failed to create site');
  }

  return site;
}

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
 * Get a site by its site key
 */
export async function getSiteByKey(siteKey: string): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.siteKey, siteKey))
    .limit(1);

  return site || null;
}

/**
 * Get a site by ID
 */
export async function getSiteById(siteId: string): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.id, siteId))
    .limit(1);

  return site || null;
}

/**
 * Update a site
 */
export async function updateSite(
  siteId: string,
  data: Partial<Pick<Site, 'name' | 'domain' | 'description'>>
): Promise<Site> {
  const [updatedSite] = await db
    .update(schema.sites)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.sites.id, siteId))
    .returning();

  if (!updatedSite) {
    throw new Error('Site not found or update failed');
  }

  return updatedSite;
}

/**
 * Delete a site
 */
export async function deleteSite(siteId: string): Promise<void> {
  await db
    .delete(schema.sites)
    .where(eq(schema.sites.id, siteId));
}

/**
 * Check if a site belongs to an organization
 */
export async function verifySiteOwnership(
  siteKey: string,
  organizationId: string
): Promise<boolean> {
  const [site] = await db
    .select()
    .from(schema.sites)
    .where(
      and(
        eq(schema.sites.siteKey, siteKey),
        eq(schema.sites.organizationId, organizationId)
      )
    )
    .limit(1);

  return !!site;
} 