import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { tempSites, events } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';

export async function createTempSite() {
  const tempId = nanoid(12);
  const siteKey = `TEMP_${nanoid(8).toUpperCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now

  await db.insert(tempSites).values({
    id: tempId,
    siteKey,
    expiresAt,
  });

  return {
    tempId,
    siteKey,
    expiresAt: expiresAt.getTime()
  };
}

export async function getTempSite(tempId: string) {
  const tempSite = await db.select().from(tempSites).where(eq(tempSites.id, tempId)).limit(1);
  
  if (!tempSite.length) {
    return null;
  }

  const site = tempSite[0];
  const now = new Date();
  
  if (now > site.expiresAt) {
    // Clean up expired site
    await db.delete(tempSites).where(eq(tempSites.id, tempId));
    await db.delete(events).where(and(
      eq(events.site, site.siteKey),
      eq(events.isTemp, true)
    ));
    return null;
  }

  // Get events for this temp site
  const tempEvents = await db.select().from(events)
    .where(and(
      eq(events.site, site.siteKey),
      eq(events.isTemp, true)
    ))
    .orderBy(events.createdAt)
    .limit(50);

  return {
    id: site.id,
    siteKey: site.siteKey,
    createdAt: site.createdAt.getTime(),
    expiresAt: site.expiresAt.getTime(),
    timeRemaining: site.expiresAt.getTime() - now.getTime(),
    events: tempEvents
  };
}

export async function addEventToTempSite(siteKey: string, eventData: any): Promise<boolean> {
  // Check if temp site exists and hasn't expired
  const tempSite = await db.select().from(tempSites)
    .where(eq(tempSites.siteKey, siteKey))
    .limit(1);
  
  if (!tempSite.length) {
    return false;
  }

  const site = tempSite[0];
  const now = new Date();
  
  if (now > site.expiresAt) {
    // Clean up expired site
    await db.delete(tempSites).where(eq(tempSites.id, site.id));
    await db.delete(events).where(and(
      eq(events.site, siteKey),
      eq(events.isTemp, true)
    ));
    return false;
  }

  // Add event to events table with temp flag
  await db.insert(events).values({
    ...eventData,
    site: siteKey,
    isTemp: true,
    id: nanoid()
  });

  // Clean up old events (keep only last 50)
  const allEvents = await db.select().from(events)
    .where(and(
      eq(events.site, siteKey),
      eq(events.isTemp, true)
    ))
    .orderBy(events.createdAt);

  if (allEvents.length > 50) {
    const eventsToDelete = allEvents.slice(0, allEvents.length - 50);
    for (const event of eventsToDelete) {
      await db.delete(events).where(eq(events.id, event.id));
    }
  }

  return true;
}

// Clean up expired temporary sites and their events
export async function cleanupExpiredTempSites() {
  const now = new Date();
  
  // Get all expired temp sites
  const expiredSites = await db.select().from(tempSites)
    .where(lt(tempSites.expiresAt, now));

  // Delete their events
  for (const site of expiredSites) {
    await db.delete(events).where(and(
      eq(events.site, site.siteKey),
      eq(events.isTemp, true)
    ));
  }

  // Delete expired temp sites
  await db.delete(tempSites).where(lt(tempSites.expiresAt, now));
  
  return expiredSites.length;
}