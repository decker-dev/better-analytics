import { nanoid } from 'nanoid';

// In-memory storage for temporary sites (resets on server restart)
export const tempSites = new Map<string, {
  id: string;
  siteKey: string;
  createdAt: number;
  expiresAt: number;
  events: any[];
}>();

// Clean up expired sites every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, site] of tempSites.entries()) {
    if (now > site.expiresAt) {
      tempSites.delete(id);
    }
  }
}, 5 * 60 * 1000);

export function createTempSite() {
  const tempId = nanoid(12);
  const siteKey = `TEMP_${nanoid(8).toUpperCase()}`;
  const now = Date.now();
  const expiresAt = now + (60 * 60 * 1000); // 1 hour from now

  const tempSite = {
    id: tempId,
    siteKey,
    createdAt: now,
    expiresAt,
    events: []
  };

  tempSites.set(tempId, tempSite);

  return {
    tempId,
    siteKey,
    expiresAt
  };
}

export function getTempSite(tempId: string) {
  const tempSite = tempSites.get(tempId);
  if (!tempSite) {
    return null;
  }

  const now = Date.now();
  if (now > tempSite.expiresAt) {
    tempSites.delete(tempId);
    return null;
  }

  return {
    ...tempSite,
    timeRemaining: tempSite.expiresAt - now
  };
}

export function addEventToTempSite(siteKey: string, eventData: any): boolean {
  for (const [id, site] of tempSites.entries()) {
    if (site.siteKey === siteKey) {
      site.events.push({
        ...eventData,
        receivedAt: Date.now()
      });
      // Keep only last 50 events to prevent memory issues
      if (site.events.length > 50) {
        site.events = site.events.slice(-50);
      }
      return true;
    }
  }
  return false;
}