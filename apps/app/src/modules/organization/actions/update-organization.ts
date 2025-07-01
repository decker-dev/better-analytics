'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { organization as organizationSchema } from '@/lib/db/schema';
import { auth } from '@/modules/auth/lib/auth';
import { and, eq, ne } from 'drizzle-orm';

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

  const requestHeaders = headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return { error: 'Unauthorized.' };
  }

  const orgWithMembers = await db.query.organization.findFirst({
    where: eq(organizationSchema.id, organizationId),
    with: {
      members: true,
    },
  });

  if (!orgWithMembers) {
    return { error: 'Organization not found.' };
  }

  const currentUserMember = orgWithMembers.members.find(
    (m) => m.userId === session.user.id,
  );

  if (
    !currentUserMember ||
    !['owner', 'admin'].includes(currentUserMember.role)
  ) {
    return { error: 'You do not have permission to perform this action.' };
  }

  if (slug !== orgWithMembers.slug) {
    const existingOrg = await db.query.organization.findFirst({
      where: and(
        eq(organizationSchema.slug, slug),
        ne(organizationSchema.id, organizationId),
      ),
    });

    if (existingOrg) {
      return { error: 'This slug is already in use.' };
    }
  }

  await db
    .update(organizationSchema)
    .set({ name, slug })
    .where(eq(organizationSchema.id, organizationId));

  revalidatePath('/', 'layout');

  if (slug !== orgWithMembers.slug) {
    redirect(`/${slug}/settings`);
  }

  return { success: true };
} 