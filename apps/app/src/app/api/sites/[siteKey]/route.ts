import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/modules/auth/lib/auth';
import { getSiteByKey, updateSite } from '@/lib/db/sites';
import { z } from 'zod';

const updateSiteSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { siteKey: string } }
) {
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

    // Get the site
    const site = await getSiteByKey(params.siteKey);

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // TODO: Verify that the user has access to this site/organization

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