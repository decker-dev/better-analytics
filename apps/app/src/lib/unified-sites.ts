import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { sites, events, type Site } from '@/lib/db/schema';
import { eq, and, lt, isNotNull } from 'drizzle-orm';
import { generateSiteKey } from '@/lib/site-key';
import { generateSiteName, createSlugFromName } from './site-name-generator';

// Crear site regular para organización
export async function createOrgSite(params: {
  name: string;
  organizationId: string;
  domain?: string;
  description?: string;
}) {
  const siteKey = await generateSiteKey();
  const siteId = nanoid();
  const slug = createSlugFromName(params.name);

  await db.insert(sites).values({
    id: siteId,
    name: params.name,
    slug,
    siteKey,
    organizationId: params.organizationId,
    domain: params.domain || null,
    description: params.description || null,
    isTemp: false,
    expiresAt: null,
  });

  return {
    siteId,
    siteKey,
    slug
  };
}

export async function getSiteBySlug(slug: string) {
  const siteResult = await db.select().from(sites)
    .where(and(
      eq(sites.slug, slug),
    ))
    .limit(1);

  if (!siteResult.length) {
    return null;
  }

  const site = siteResult[0];
  if (!site) {
    return null;
  }

  const siteEvents = await db.select().from(events)
    .where(eq(events.site, site.siteKey))
    .orderBy(events.createdAt)
    .limit(50);

  // Calculate timeRemaining for temp sites
  const timeRemaining = site.expiresAt
    ? Math.max(0, site.expiresAt.getTime() - Date.now())
    : null;

  return {
    id: site.id,
    siteKey: site.siteKey,
    name: site.name,
    slug: site.slug,
    createdAt: site.createdAt.getTime(),
    expiresAt: site.expiresAt?.getTime() || null,
    timeRemaining,
    events: siteEvents
  };
}


// Obtener site por siteKey (temporal o regular)
export async function getSiteBySiteKey(siteKey: string): Promise<Site | null> {
  const siteResult = await db.select().from(sites)
    .where(eq(sites.siteKey, siteKey))
    .limit(1);

  return siteResult[0] || null;
}


// Limpiar site expirado y sus eventos
async function cleanupExpiredSite(siteId: string) {
  const site = await db.select().from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (site.length > 0 && site[0]) {
    // Eliminar eventos del site
    await db.delete(events).where(eq(events.site, site[0].siteKey));

    // Eliminar site
    await db.delete(sites).where(eq(sites.id, siteId));
  }
}

// Limpiar todos los sites temporales expirados
export async function cleanupExpiredTempSites() {
  const now = new Date();

  // Obtener sites temporales expirados
  const expiredSites = await db.select().from(sites)
    .where(and(
      eq(sites.isTemp, true),
      isNotNull(sites.expiresAt),
      lt(sites.expiresAt, now)
    ));

  // Eliminar eventos de sites expirados
  for (const site of expiredSites) {
    await db.delete(events).where(eq(events.site, site.siteKey));
  }

  // Eliminar sites expirados
  if (expiredSites.length > 0) {
    await db.delete(sites)
      .where(and(
        eq(sites.isTemp, true),
        isNotNull(sites.expiresAt),
        lt(sites.expiresAt, now)
      ));
  }

  return expiredSites.length;
}