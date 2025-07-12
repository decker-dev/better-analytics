import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { sites, events, type NewEvent, type Site } from '@/lib/db/schema';
import { eq, and, lt, isNull, isNotNull } from 'drizzle-orm';
import { generateSiteKey } from '@/lib/site-key';

// Crear site temporal para demo
export async function createTempSite() {
  const siteKey = generateSiteKey();
  const siteId = nanoid();
  const tempSlug = generateSlug(); // Generar slug normal
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hora

  await db.insert(sites).values({
    id: siteId,
    name: "Demo Site",
    slug: tempSlug,
    siteKey,
    organizationId: null, // Null para sites temporales
    domain: null,
    description: "Temporary demo site",
    isTemp: true,
    expiresAt,
  });

  return {
    siteId,
    siteKey,
    slug: tempSlug,
    expiresAt: expiresAt.getTime()
  };
}

// Crear site regular para organización
export async function createOrgSite(params: {
  name: string;
  organizationId: string;
  domain?: string;
  description?: string;
}) {
  const siteKey = generateSiteKey();
  const siteId = nanoid();
  const slug = generateSlug(params.name);

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

// Obtener site temporal por slug
export async function getTempSiteBySlug(slug: string) {
  const siteResult = await db.select().from(sites)
    .where(and(
      eq(sites.slug, slug),
      eq(sites.isTemp, true)
    ))
    .limit(1);

  if (!siteResult.length) {
    return null;
  }

  const site = siteResult[0];
  if (!site) {
    return null;
  }

  const now = new Date();

  // Verificar si expiró
  if (site.expiresAt && now > site.expiresAt) {
    // Limpiar site expirado
    await cleanupExpiredSite(site.id);
    return null;
  }

  // Obtener eventos para este site
  const siteEvents = await db.select().from(events)
    .where(eq(events.site, site.siteKey))
    .orderBy(events.createdAt)
    .limit(50);

  return {
    id: site.id,
    siteKey: site.siteKey,
    name: site.name,
    slug: site.slug,
    createdAt: site.createdAt.getTime(),
    expiresAt: site.expiresAt?.getTime() || null,
    timeRemaining: site.expiresAt ? site.expiresAt.getTime() - now.getTime() : null,
    events: siteEvents
  };
}

// Obtener site temporal por siteKey (para APIs)
export async function getTempSite(siteKey: string) {
  const siteResult = await db.select().from(sites)
    .where(and(
      eq(sites.siteKey, siteKey),
      eq(sites.isTemp, true)
    ))
    .limit(1);

  if (!siteResult.length) {
    return null;
  }

  const site = siteResult[0];
  if (!site) {
    return null;
  }

  const now = new Date();

  // Verificar si expiró
  if (site.expiresAt && now > site.expiresAt) {
    // Limpiar site expirado
    await cleanupExpiredSite(site.id);
    return null;
  }

  // Obtener eventos para este site
  const siteEvents = await db.select().from(events)
    .where(eq(events.site, site.siteKey))
    .orderBy(events.createdAt)
    .limit(50);

  return {
    id: site.id,
    siteKey: site.siteKey,
    name: site.name,
    slug: site.slug,
    createdAt: site.createdAt.getTime(),
    expiresAt: site.expiresAt?.getTime() || null,
    timeRemaining: site.expiresAt ? site.expiresAt.getTime() - now.getTime() : null,
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

// Agregar evento a cualquier site (temporal o regular)
export async function addEventToSite(siteKey: string, eventData: Omit<NewEvent, 'id' | 'site' | 'createdAt'>): Promise<boolean> {
  const site = await getSiteBySiteKey(siteKey);

  if (!site) {
    return false;
  }

  // Si es temporal, verificar que no haya expirado
  if (site.isTemp && site.expiresAt) {
    const now = new Date();
    if (now > site.expiresAt) {
      await cleanupExpiredSite(site.id);
      return false;
    }
  }

  // Agregar evento
  await db.insert(events).values({
    ...eventData,
    site: siteKey,
    id: nanoid()
  });

  // Para sites temporales, mantener solo los últimos 50 eventos
  if (site.isTemp) {
    const allEvents = await db.select().from(events)
      .where(eq(events.site, siteKey))
      .orderBy(events.createdAt);

    if (allEvents.length > 50) {
      const eventsToDelete = allEvents.slice(0, allEvents.length - 50);
      for (const event of eventsToDelete) {
        await db.delete(events).where(eq(events.id, event.id));
      }
    }
  }

  return true;
}

// Convertir site temporal a permanente (claim)
export async function claimTempSite(siteKey: string, organizationId: string, newName: string, newDescription?: string): Promise<string | null> {
  const siteResult = await db.select().from(sites)
    .where(and(
      eq(sites.siteKey, siteKey),
      eq(sites.isTemp, true)
    ))
    .limit(1);

  if (!siteResult.length) {
    throw new Error("Temporary site not found");
  }

  const site = siteResult[0];
  if (!site) {
    throw new Error("Temporary site not found");
  }

  // Verificar que no haya expirado
  if (site.expiresAt && new Date() > site.expiresAt) {
    throw new Error("Temporary site has expired");
  }

  const newSlug = generateSlug(newName);

  // Convertir de temporal a permanente
  await db.update(sites)
    .set({
      name: newName,
      slug: newSlug,
      organizationId,
      description: newDescription || null,
      isTemp: false,
      expiresAt: null,
    })
    .where(eq(sites.id, site.id));

  return site.siteKey;
}

// Limpiar site expirado y sus eventos
async function cleanupExpiredSite(siteId: string) {
  const site = await db.select().from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (site.length > 0) {
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

// Obtener todos los sites de una organización (solo permanentes)
export async function getOrgSites(organizationId: string) {
  return await db.select().from(sites)
    .where(and(
      eq(sites.organizationId, organizationId),
      eq(sites.isTemp, false)
    ))
    .orderBy(sites.createdAt);
}