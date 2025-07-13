'use server';

import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/modules/auth/lib/auth';
import { headers } from 'next/headers';

const updateSiteSchema = z.object({
  siteId: z.string().min(1, 'Site ID is required'),
  name: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  domain: z.string().optional(),
  description: z.string().optional(),
  orgSlug: z.string().min(1, 'Organization slug is required'),
  currentSlug: z.string().min(1, 'Current slug is required'),
});

/**
 * Generate a URL-friendly slug from a site name
 */
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensure slug is unique by appending a number if needed
 */
async function ensureUniqueSlug(baseSlug: string, currentSiteId: string, organizationId: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    // Check if slug exists for another site in the same organization
    const existingSite = await db
      .select({ id: sites.id })
      .from(sites)
      .where(
        and(
          eq(sites.slug, slug),
          eq(sites.organizationId, organizationId),
          ne(sites.id, currentSiteId)
        )
      )
      .limit(1);

    if (existingSite.length === 0) {
      return slug;
    }

    // If slug exists, try with a number suffix
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Prevent infinite loop
    if (counter > 100) {
      throw new Error('Unable to generate unique slug');
    }
  }
}

export async function updateSiteAction(prevState: unknown, formData: FormData) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        serverError: 'Authentication required',
      };
    }

    // Parse form data
    const rawData = {
      siteId: formData.get('siteId') as string,
      name: formData.get('name') as string,
      domain: formData.get('domain') as string,
      description: formData.get('description') as string,
      orgSlug: formData.get('orgSlug') as string,
      currentSlug: formData.get('currentSlug') as string,
    };

    // Validate with zod
    const validationResult = updateSiteSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        validationErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const { siteId, name, domain, description, orgSlug, currentSlug } = validationResult.data;

    // Get the current site to verify ownership and get organization ID
    const [currentSite] = await db
      .select({
        id: sites.id,
        organizationId: sites.organizationId,
        name: sites.name,
        slug: sites.slug,
      })
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    if (!currentSite) {
      return {
        success: false,
        serverError: 'Site not found',
      };
    }

    // Generate new slug from name
    const baseSlug = generateSlugFromName(name);
    if (!baseSlug) {
      return {
        success: false,
        serverError: 'Invalid site name - cannot generate slug',
      };
    }

    // Ensure slug is unique
    const uniqueSlug = await ensureUniqueSlug(
      baseSlug,
      siteId,
      currentSite.organizationId!
    );

    // Update the site
    const [updatedSite] = await db
      .update(sites)
      .set({
        name: name.trim(),
        slug: uniqueSlug,
        domain: domain?.trim() || null,
        description: description?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, siteId))
      .returning();

    if (!updatedSite) {
      return {
        success: false,
        serverError: 'Failed to update site',
      };
    }

    // Revalidate relevant paths
    revalidatePath(`/${orgSlug}/sites`);
    revalidatePath(`/${orgSlug}/sites/${currentSlug}`);
    revalidatePath(`/${orgSlug}/sites/${uniqueSlug}`);

    return {
      success: true,
      data: {
        id: updatedSite.id,
        name: updatedSite.name,
        slug: updatedSite.slug,
        domain: updatedSite.domain,
        description: updatedSite.description,
        organizationSlug: orgSlug,
      },
    };
  } catch (error) {
    console.error('Error updating site:', error);
    return {
      success: false,
      serverError: error instanceof Error ? error.message : 'Failed to update site',
    };
  }
} 