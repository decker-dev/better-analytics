import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/modules/auth/lib/auth';
import { createSite } from '@/lib/db/sites';
import { generateSiteName } from '@/lib/site-name-generator';
import { generateUniqueSiteKey } from '@/lib/site-key';
import { db } from '@/lib/db';
import { organization, member } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has organizations
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    if (organizations && organizations.length > 0) {
      return NextResponse.json({
        orgSlug: organizations[0]!.slug,
        redirectUrl: `/${organizations[0]!.slug}/sites`
      });
    }

    // Generate organization details from email
    const emailUsername = session.user.email.split('@')[0] || 'user';
    const orgName = session.user.name || `${emailUsername}'s Organization`;
    const orgSlug = emailUsername.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Ensure slug is unique by adding a suffix if needed
    let slugAttempts = 0;
    let finalSlug = orgSlug;

    while (slugAttempts < 10) {
      const existingOrg = await db.query.organization.findFirst({
        where: (org, { eq }) => eq(org.slug, finalSlug)
      });

      if (!existingOrg) {
        break;
      }

      slugAttempts++;
      finalSlug = `${orgSlug}-${slugAttempts}`;
    }

    // Create organization in database
    const orgId = nanoid();
    const [newOrg] = await db.insert(organization).values({
      id: orgId,
      name: orgName,
      slug: finalSlug,
    }).returning();

    if (!newOrg) {
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
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
      "Your first analytics site",
      siteKey
    );

    return NextResponse.json({
      orgSlug: finalSlug,
      siteKey: site.siteKey,
      redirectUrl: `/${finalSlug}/sites/${site.siteKey}/onboarding`
    });

  } catch (error) {
    console.error('Error in onboarding setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 