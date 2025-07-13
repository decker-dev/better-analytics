'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCachedSession } from '@/modules/auth/lib/auth-cache';
import { auth } from '@/modules/auth/lib/auth';
import { TAGS } from '@/modules/shared/lib/tags';
import { db } from '@/modules/shared/lib/db';
import { eq, and, ne } from 'drizzle-orm';
import { organization } from '@/modules/shared/lib/db/schema';

const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1, 'Organization name cannot be empty.'),
  slug: z
    .string()
    .min(1, 'Slug cannot be empty.')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens.',
    ),
});

/**
 * Check if a slug is available for use by an organization
 * @param slug The slug to check
 * @param currentOrgId The ID of the current organization (to exclude it from the check)
 * @returns true if the slug is available, false if it's already taken
 */
async function isSlugAvailable(slug: string, currentOrgId: string): Promise<boolean> {
  const existingOrg = await db.query.organization.findFirst({
    where: and(
      eq(organization.slug, slug),
      ne(organization.id, currentOrgId)
    ),
  });

  return !existingOrg;
}

export async function updateOrganization(formData: FormData) {
  const rawData = {
    organizationId: formData.get('organizationId'),
    name: formData.get('name'),
    slug: formData.get('slug'),
  };

  const validated = updateOrganizationSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join(', ') };
  }

  const { organizationId, name, slug } = validated.data;

  // Await headers() call to fix Next.js 15+ issue
  const requestHeaders = await headers();
  const session = await getCachedSession(requestHeaders);

  if (!session) {
    return { error: 'Unauthorized.' };
  }

  try {
    // Get the current organization to check the current slug
    const currentOrg = await auth.api.getFullOrganization({
      headers: requestHeaders,
      query: {
        organizationId,
      },
    });

    if (!currentOrg) {
      return { error: 'Organization not found.' };
    }

    // Check if user has permission to update
    const currentUserMember = currentOrg.members?.find(
      (m) => m.userId === session.user.id,
    );

    if (
      !currentUserMember ||
      !['owner', 'admin'].includes(currentUserMember.role)
    ) {
      return { error: 'You do not have permission to perform this action.' };
    }

    // If the slug is changing, check if the new slug is available
    if (slug !== currentOrg.slug) {
      const slugAvailable = await isSlugAvailable(slug, organizationId);
      if (!slugAvailable) {
        return { error: 'This slug is already in use. Please choose a different one.' };
      }
    }

    // Use Better Auth's organization update method
    const result = await auth.api.updateOrganization({
      headers: requestHeaders,
      body: {
        data: {
          name,
          slug,
        },
        organizationId,
      },
    });

    if (!result) {
      return { error: 'Failed to update organization.' };
    }

    // Invalidate all cached data that depends on organizations
    revalidateTag(TAGS.AUTH_CACHE);
    revalidateTag(TAGS.ORGANIZATIONS);
    revalidateTag(TAGS.ORGANIZATION);
    revalidateTag(TAGS.SESSION);

    // Revalidate specific paths
    revalidatePath('/', 'layout');
    revalidatePath(`/${currentOrg.slug}`, 'layout');
    revalidatePath(`/${slug}`, 'layout');

    // If slug changed, redirect to new URL (this will throw NEXT_REDIRECT)
    if (slug !== currentOrg.slug) {
      redirect(`/${slug}/settings`);
    }

    return { success: true };
  } catch (error) {
    // Check if this is a redirect error (expected behavior when slug changes)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is expected when slug changes, re-throw to allow the redirect
      throw error;
    }

    // Only log unexpected errors
    console.error('Error updating organization:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('slug') && error.message.includes('unique')) {
        return { error: 'This slug is already in use. Please choose a different one.' };
      }
      return { error: error.message };
    }

    return { error: 'An unexpected error occurred.' };
  }
} 