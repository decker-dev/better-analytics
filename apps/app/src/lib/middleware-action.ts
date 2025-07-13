import type { z } from 'zod';
import type { Organization, Member } from '@/lib/db/schema';
import { auth } from '@/modules/auth/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { member, organization, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown; // This allows for additional properties
};

export type User = typeof user.$inferSelect;

export type OrganizationWithMembers = Organization & {
  members: (Member & { user: User })[];
};

// Helper function to get current user
export const getUser = async (): Promise<User | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user as User;
};

// Helper function to get user with organization
export const getUserWithOrganization = async (): Promise<{
  user: User;
  organization: OrganizationWithMembers;
} | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Get user's organization membership
  const [userMembership] = await db
    .select({
      organization: organization,
      member: member,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (!userMembership) {
    return null;
  }

  // Get all members of the organization
  const orgMembers = await db
    .select({
      member: member,
      user: user,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, userMembership.organization.id));

  const organizationWithMembers: OrganizationWithMembers = {
    ...userMembership.organization,
    members: orgMembers.map(({ member, user }) => ({
      ...member,
      user,
    })),
  };

  return {
    user: session.user as User,
    organization: organizationWithMembers,
  };
};

type ValidatedActionFunction<S extends z.ZodType<unknown, z.ZodTypeDef, unknown>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<unknown, z.ZodTypeDef, unknown>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0]?.message || 'Validation failed' };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<unknown, z.ZodTypeDef, unknown>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<unknown, z.ZodTypeDef, unknown>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0]?.message || 'Validation failed' };
    }

    return action(result.data, formData, user);
  };
}

type ActionWithOrganizationFunction<T> = (
  formData: FormData,
  organization: OrganizationWithMembers,
  user: User
) => Promise<T>;

export function withOrganization<T>(action: ActionWithOrganizationFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const userWithOrg = await getUserWithOrganization();
    if (!userWithOrg) {
      redirect('/sign-in');
    }

    return action(formData, userWithOrg.organization, userWithOrg.user);
  };
}
