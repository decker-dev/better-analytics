'use server';

import { createTempSite, getTempSite } from '@/lib/temp-sites';
import { redirect } from 'next/navigation';

export async function createTemporarySite() {
  try {
    const tempSiteData = createTempSite();
    return { success: true, redirectTo: `/start/${tempSiteData.tempId}` };
  } catch (error) {
    console.error('Error creating temporary site:', error);
    return { success: false, error: 'Failed to create temporary site' };
  }
}

export async function getTemporarySite(tempId: string) {
  try {
    const tempSite = getTempSite(tempId);
    
    if (!tempSite) {
      return { error: 'Temporary site not found or expired' };
    }

    return { success: true, data: tempSite };
  } catch (error) {
    console.error('Error fetching temporary site:', error);
    return { error: 'Failed to fetch temporary site' };
  }
}