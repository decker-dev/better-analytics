'use server';

import { authActionClient } from '@/lib/safe-action';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { generateSiteKey } from '@/lib/site-key';
import { generateSlug } from '@/lib/site-name-generator';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createSiteSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  orgSlug: z.string().min(1, 'Organization slug is required'),
});

export const createSiteAction = authActionClient
  .schema(createSiteSchema)
  .metadata({
    name: 'create-site',
    track: {
      event: 'site_created',
      channel: 'dashboard',
    },
  })
  .action(async ({ parsedInput, ctx }) => {
    const { organizationId, orgSlug } = parsedInput;

    try {
      // Generate unique site key
      const siteKey = await generateSiteKey();

      // Generate random slug and name
      const slug = generateSlug();
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

      return {
        success: true,
        data: {
          site: newSite,
        },
      };
    } catch (error) {
      console.error('Error creating site:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create site');
    }
  }); 