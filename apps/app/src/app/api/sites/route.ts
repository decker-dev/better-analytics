import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/modules/auth/lib/auth';
import { createSite } from '@/modules/sites/lib/sites';
import { z } from 'zod';
import { getSitesByOrg } from "@/modules/sites/lib/sites";

const createSiteSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().optional(),
  description: z.string().optional(),
  siteKey: z.string().optional(), // Allow custom site key for onboarding
});

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

    // Parse and validate request body   
    const body = await request.json();
    const validatedData = createSiteSchema.parse(body);

    // TODO: Verify that the user has access to this organization
    // For now, we'll trust the organizationId from the request

    // Create the site
    const site = await createSite(
      validatedData.organizationId,
      validatedData.name,
      validatedData.domain,
      validatedData.description,
      validatedData.siteKey
    );

    return NextResponse.json(site);
  } catch (error) {
    console.error('Error creating site:', error);

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

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orgId from query parameters
    const url = new URL(request.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    // Get user's organizations to verify access
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    // Verify user has access to this organization
    const hasAccess = organizations?.some((org) => org.id === orgId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get sites for this organization
    const sites = await getSitesByOrg(orgId);

    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 