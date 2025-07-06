import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/modules/auth/lib/auth';
import { getSiteBySlug, updateSite, verifySiteOwnershipBySlug } from '@/modules/sites/lib/sites';
import { z } from 'zod';

const updateSiteSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Get current organization from session
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    const currentOrg = organizations?.find(org => org.id === session.session.activeOrganizationId);

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify site ownership
    const isOwner = await verifySiteOwnershipBySlug(slug, currentOrg.id);
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Get the site
    const site = await getSiteBySlug(slug, currentOrg.id);

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateSiteSchema.parse(body);

    // Update the site
    const updatedSite = await updateSite(site.id, validatedData);

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 