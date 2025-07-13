'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@/modules/auth/lib/auth';
import { TAGS } from '@/modules/shared/lib/tags';
import { validatedActionWithUser, type ActionState } from '@/modules/shared/lib/middleware-action';

const inviteMemberSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be either admin or member' }),
  }),
});

export const inviteMember = validatedActionWithUser(
  inviteMemberSchema,
  async (data, formData, user): Promise<ActionState> => {
    const { organizationId, email, role } = data;

    try {
      const requestHeaders = await headers();

      // Check if user has permission to invite members
      const organization = await auth.api.getFullOrganization({
        headers: requestHeaders,
        query: {
          organizationId,
        },
      });

      if (!organization) {
        return {
          success: false,
          message: 'Organization not found',
          errors: { organizationId: ['Organization not found'] },
        };
      }

      const currentUserMember = organization.members?.find(
        (m) => m.userId === user.id,
      );

      if (
        !currentUserMember ||
        !['owner', 'admin'].includes(currentUserMember.role)
      ) {
        return {
          success: false,
          message: 'You do not have permission to invite members',
          errors: { organizationId: ['Insufficient permissions'] },
        };
      }

      // Invite the member using Better Auth
      const result = await auth.api.inviteMember({
        headers: requestHeaders,
        body: {
          email: email.trim(),
          role,
          organizationId,
        },
      });

      if (!result) {
        return {
          success: false,
          message: 'Failed to send invitation. Please try again',
          errors: { email: ['Failed to send invitation'] },
        };
      }

      // Invalidate cached data
      revalidateTag(TAGS.ORGANIZATIONS);
      revalidateTag(TAGS.ORGANIZATION);
      revalidatePath(`/${organization.slug}/settings`);

      return {
        success: true,
        message: `Invitation sent successfully to ${email}`,
      };

    } catch (error) {
      console.error('Error inviting member:', error);

      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('already exists') || error.message.includes('already invited')) {
          return {
            success: false,
            message: 'User is already a member or has a pending invitation',
            errors: { email: ['User is already a member or has a pending invitation'] },
          };
        }

        return {
          success: false,
          message: error.message,
          errors: { email: [error.message] },
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again',
        errors: { email: ['Unexpected error occurred'] },
      };
    }
  }
); 