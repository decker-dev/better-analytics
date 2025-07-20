'use server';

import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import { db, organization, member, sites } from "@repo/database";
import { generateRandomName } from "@/modules/shared/lib/site-name-generator";
import { generateSiteKey } from "@/modules/shared/lib/site-key";

interface CreateFirstSetupResult {
  success: boolean;
  data?: {
    organizationId: string;
    organizationSlug: string;
    siteId: string;
    siteKey: string;
  };
  error?: string;
}

export const createFirstOrganizationAndSite = async (): Promise<CreateFirstSetupResult> => {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Check if user already has organizations
    const existingOrgs = await auth.api.listOrganizations({ headers: requestHeaders });

    if (existingOrgs && existingOrgs.length > 0) {
      return { success: false, error: "User already has organizations" };
    }
    const orgSlug = generateRandomName()

    const [organizationData] = await db.insert(organization).values({
      name: orgSlug,
      slug: orgSlug,
    }).returning();

    if (!organizationData) {
      return { success: false, error: "Failed to create organization" };
    }

    // Add user as admin member
    await db.insert(member).values({
      userId,
      organizationId: organizationData.id,
      role: 'admin',
    });

    const siteKey = await generateSiteKey();
    const siteSlug = generateRandomName();

    const [newSite] = await db.insert(sites).values({
      name: siteSlug,
      slug: siteSlug,
      siteKey,
      organizationId: organizationData.id,
      isTemp: false,
    }).returning();

    if (!newSite) {
      return { success: false, error: "Failed to create site" };
    }

    return {
      success: true,
      data: {
        organizationId: organizationData.id,
        organizationSlug: orgSlug,
        siteId: newSite.id,
        siteKey: siteKey,
      },
    };

  } catch (error) {
    console.error("Error creating first setup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}; 