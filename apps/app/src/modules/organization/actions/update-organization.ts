'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/modules/auth/lib/auth';
import { TAGS } from '@/modules/shared/lib/tags';
import { db, organization } from '@repo/database';
import { eq, and, ne } from 'drizzle-orm';
import { validatedActionWithUser, type ActionState } from '@/modules/shared/lib/middleware-action';

const updateOrganizationSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(1, 'Organization name is required').max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
});

/**
 * Check if a slug is available for use by an organization
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

export const updateOrganization = validatedActionWithUser(
  updateOrganizationSchema,
  async (data, formData, user): Promise<ActionState> => {
    const { organizationId, name, slug } = data;

    try {
      // Await headers() call to fix Next.js 15+ issue
      const requestHeaders = await headers();

      // Get the current organization to check permissions and current slug
      const currentOrg = await auth.api.getFullOrganization({
        headers: requestHeaders,
        query: {
          organizationId,
        },
      });

      if (!currentOrg) {
        return {
          success: false,
          message: 'Organization not found',
          errors: { organizationId: ['Organization not found'] }
        };
      }

      // Check if user has permission to update
      const currentUserMember = currentOrg.members?.find(
        (m) => m.userId === user.id,
      );

      if (
        !currentUserMember ||
        !['owner', 'admin'].includes(currentUserMember.role)
      ) {
        return {
          success: false,
          message: 'You do not have permission to perform this action',
          errors: { organizationId: ['Insufficient permissions'] }
        };
      }

      // If the slug is changing, check if the new slug is available
      if (slug !== currentOrg.slug) {
        const slugAvailable = await isSlugAvailable(slug, organizationId);
        if (!slugAvailable) {
          return {
            success: false,
            message: 'This slug is already in use. Please choose a different one',
            errors: { slug: ['This slug is already in use'] }
          };
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
        return {
          success: false,
          message: 'Failed to update organization. Please try again',
          errors: { organizationId: ['Update failed'] }
        };
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

      return {
        success: true,
        message: 'Organization updated successfully!'
      };

    } catch (error) {
      // Check if this is a redirect error (expected behavior when slug changes)
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        // This is expected when slug changes, re-throw to allow the redirect
        throw error;
      }

      console.error('Error updating organization:', error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('slug') && error.message.includes('unique')) {
          return {
            success: false,
            message: 'This slug is already in use. Please choose a different one',
            errors: { slug: ['This slug is already in use'] }
          };
        }
        return {
          success: false,
          message: error.message,
          errors: { organizationId: [error.message] }
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again',
        errors: { organizationId: ['Unexpected error occurred'] }
      };
    }
  }
); 