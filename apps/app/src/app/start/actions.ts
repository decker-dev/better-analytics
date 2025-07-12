'use server';

import { sites } from '@/lib/db/schema';
import { generateSiteKey } from '@/lib/site-key';
import { generateSiteName } from '@/lib/site-name-generator';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';

export async function createTemporarySite() {
  try {
    const siteKey = await generateSiteKey();
    const siteId = nanoid();
    const tempSlug = generateSiteName();
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

    return { success: true, redirectTo: `/start/${tempSlug}` };
  } catch (error) {
    console.error('Error creating temporary site:', error);
    return { success: false, error: 'Failed to create temporary site' };
  }
}