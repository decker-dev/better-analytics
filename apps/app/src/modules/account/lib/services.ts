import { account, db, member, organization } from "@repo/database";
import { eq } from "drizzle-orm";
import type { UserAccountData, LinkedProvider } from "../types/account";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";

export const getUserAccountData = async (): Promise<UserAccountData | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

  // Get linked providers
  const linkedAccounts = await db
    .select({
      providerId: account.providerId,
      accountId: account.accountId,
      createdAt: account.createdAt,
    })
    .from(account)
    .where(eq(account.userId, userId));

  const linkedProviders: LinkedProvider[] = linkedAccounts.map((acc) => ({
    providerId: acc.providerId,
    accountId: acc.accountId,
    createdAt: acc.createdAt,
    providerName: getProviderDisplayName(acc.providerId),
    isVerified: true, // Better Auth providers are typically verified
  }));

  // Get user's organizations with their roles
  const userOrganizations = await db
    .select({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      member: {
        role: member.role,
        createdAt: member.createdAt,
      },
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId));

  const organizations = userOrganizations.map(({ organization: org, member: mem }) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    role: mem.role,
    createdAt: mem.createdAt,
  }));

  return {
    user: session.user,
    linkedProviders,
    organizations,
  };
};

export const getLinkedProviders = async (userId: string): Promise<LinkedProvider[]> => {
  const linkedAccounts = await db
    .select({
      providerId: account.providerId,
      accountId: account.accountId,
      createdAt: account.createdAt,
    })
    .from(account)
    .where(eq(account.userId, userId));

  return linkedAccounts.map((acc) => ({
    providerId: acc.providerId,
    accountId: acc.accountId,
    createdAt: acc.createdAt,
    providerName: getProviderDisplayName(acc.providerId),
    isVerified: true,
  }));
};

function getProviderDisplayName(providerId: string): string {
  const providerNames: Record<string, string> = {
    "github": "GitHub",
    "google": "Google",
    "email": "Email",
    "magicLink": "Magic Link",
  };

  return providerNames[providerId] || providerId;
}

export const getUserOrganizations = async (userId: string) => {
  return await db
    .select({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      member: {
        role: member.role,
        createdAt: member.createdAt,
      },
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId));
}; 