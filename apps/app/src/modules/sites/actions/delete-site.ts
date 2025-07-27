'use server';

import { db, sites } from '@repo/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { validatedActionWithUser, type ActionState } from '@/modules/shared/lib/middleware-action';
import { redirect } from 'next/navigation';

const deleteSiteSchema = z.object({
  siteId: z.string().min(1, 'Site ID is required'),
  orgSlug: z.string().min(1, 'Organization slug is required'),
  confirmation: z.string().min(1, 'Please type the site name to confirm'),
});

export const deleteSite = validatedActionWithUser(
  deleteSiteSchema,
  async (data, formData, user): Promise<ActionState> => {
    const { siteId, orgSlug, confirmation } = data;

    try {
      // Get the site to verify ownership and get organization ID
      const [siteToDelete] = await db
        .select({
          id: sites.id,
          organizationId: sites.organizationId,
          name: sites.name,
          siteKey: sites.siteKey,
        })
        .from(sites)
        .where(eq(sites.id, siteId))
        .limit(1);

      if (!siteToDelete) {
        return {
          success: false,
          message: 'Site not found',
          errors: { siteId: ['Site not found'] },
        };
      }

      // Verify confirmation text matches site name
      if (confirmation !== siteToDelete.name) {
        return {
          success: false,
          message: 'Site name confirmation does not match',
          errors: { confirmation: ['Please type the exact site name to confirm deletion'] },
        };
      }

      // Delete the site - this will cascade delete all analytics data
      // due to onDelete: 'cascade' foreign key constraints:
      // - events table references sites.siteKey
      // - webEvents, mobileEvents, serverEvents, geoEvents reference events.id
      const [deletedSite] = await db
        .delete(sites)
        .where(eq(sites.id, siteId))
        .returning();

      if (!deletedSite) {
        return {
          success: false,
          message: 'Failed to delete site',
          errors: { siteId: ['Failed to delete site'] },
        };
      }

      // Revalidate paths
      revalidatePath(`/${orgSlug}/sites`);
      revalidatePath(`/${orgSlug}`);

      // Redirect to sites list (this throws NEXT_REDIRECT)
      redirect(`/${orgSlug}/sites`);
    } catch (error) {
      // Re-throw redirect errors so Next.js can handle them
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }

      console.error('Error deleting site:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete site',
        errors: { siteId: [error instanceof Error ? error.message : 'Failed to delete site'] },
      };
    }
  }
); 