'use server';

import { createTempSite, getTempSiteBySlug } from '@/lib/unified-sites';
import { redirect } from 'next/navigation';

export async function createTemporarySite() {
  try {
    const tempSiteData = await createTempSite();
    return { success: true, redirectTo: `/start/${tempSiteData.slug}` };
  } catch (error) {
    console.error('Error creating temporary site:', error);
    return { success: false, error: 'Failed to create temporary site' };
  }
}

export async function getTemporarySite(slug: string) {
  try {
    const tempSite = await getTempSiteBySlug(slug);
    
    if (!tempSite) {
      return { error: 'Temporary site not found or expired' };
    }

    return { success: true, data: tempSite };
  } catch (error) {
    console.error('Error fetching temporary site:', error);
    return { error: 'Failed to fetch temporary site' };
  }
}