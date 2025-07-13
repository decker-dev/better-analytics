'use server';

import { z } from 'zod';
import { db } from '@/modules/shared/lib/db';
import { sites } from '@/modules/shared/lib/db/schema';
import { generateSiteKey } from '@/modules/shared/lib/site-key';
import { generateRandomName } from '@/modules/shared/lib/site-name-generator';
import { revalidatePath } from 'next/cache';
import { validatedActionWithUser } from '@/modules/shared/lib/middleware-action';
import { redirect } from 'next/navigation';

const createSiteSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  orgSlug: z.string().min(1, 'Organization slug is required'),
});

export const createSite = validatedActionWithUser(
  createSiteSchema,
  async (data, formData, user) => {
    const { organizationId, orgSlug } = data;

    try {
      // Generate unique site key
      const siteKey = await generateSiteKey();

      // Generate random slug and name
      const slug = generateRandomName();
      const name = slug.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Create the site
      const [newSite] = await db.insert(sites).values({
        name,
        slug,
        siteKey,
        organizationId,
        isTemp: false,
      }).returning();

      if (!newSite) {
        throw new Error('Failed to create site');
      }

      // Revalidate the sites page
      revalidatePath(`/${orgSlug}/sites`);

      // Redirect to onboarding (this throws NEXT_REDIRECT)
      redirect(`/${orgSlug}/sites/${newSite.slug}/onboarding`);
    } catch (error) {
      // Re-throw redirect errors so Next.js can handle them
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }

      console.error('Error creating site:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to create site',
      };
    }
  }
); 