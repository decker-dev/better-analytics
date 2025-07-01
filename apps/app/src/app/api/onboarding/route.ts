import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/modules/auth/lib/auth';
import { createSite } from '@/lib/db/sites';
import { generateSiteName } from '@/lib/site-name-generator';
import { generateUniqueSiteKey } from '@/lib/site-key';
import { db } from '@/lib/db';
import { organization, member } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

/**
 * Generates a unique identifier for an organization's name and slug.
 * It starts with a base identifier and appends a random suffix if collisions occur.
 */
async function generateUniqueOrgIdentifier(
  baseIdentifier: string,
): Promise<string> {
  let finalIdentifier = baseIdentifier;
  let attempts = 0;

  while (attempts < 10) {
    const existingOrg = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.slug, finalIdentifier),
    });

    if (!existingOrg) {
      return finalIdentifier; // It's unique
    }

    // If collision, append a short random string
    finalIdentifier = `${baseIdentifier}-${nanoid(4)}`;
    attempts++;
  }

  // Fallback if we can't find a unique slug after 10 tries
  return `${baseIdentifier}-${nanoid(8)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has organizations
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (organizations && organizations.length > 0) {
      return NextResponse.json({
        orgSlug: organizations[0]!.slug,
        redirectUrl: `/${organizations[0]!.slug}/sites`,
      });
    }

    // Generate organization identifier from email
    const baseIdentifier = (session.user.email.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Remove invalid chars
      .replace(/--+/g, '-') // Replace multiple hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // Ensure identifier is unique and use it for both name and slug
    const orgIdentifier = await generateUniqueOrgIdentifier(baseIdentifier);

    // Create organization in database
    const orgId = nanoid();
    const [newOrg] = await db
      .insert(organization)
      .values({
        id: orgId,
        name: orgIdentifier,
        slug: orgIdentifier,
      })
      .returning();

    if (!newOrg) {
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 },
      );
    }

    // Add user as owner of the organization
    await db.insert(member).values({
      id: nanoid(),
      userId: session.user.id,
      organizationId: orgId,
      role: 'owner',
    });

    // Create first site
    const siteName = generateSiteName();
    const siteKey = await generateUniqueSiteKey(orgId);

    const site = await createSite(
      orgId,
      siteName,
      undefined,
      'Your first analytics site',
      siteKey,
    );

    return NextResponse.json({
      orgSlug: orgIdentifier,
      siteKey: site.siteKey,
      redirectUrl: `/${orgIdentifier}/sites/${site.siteKey}/onboarding`,
    });
  } catch (error) {
    console.error('Error in onboarding setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
} 