import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  incomingEventSchema,
  processEvent,
  saveEvent,
  getSiteConfig,
  validateDomainProtection,
} from '@/modules/collect';

// Handle CORS preflight request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate incoming data
    const validatedData = incomingEventSchema.parse(body);

    // Site key is now required from validation
    const siteKey = validatedData.site;

    // Get site configuration
    const siteConfig = await getSiteConfig(siteKey);

    if (!siteConfig) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validate domain protection if enabled
    if (!validateDomainProtection(siteConfig, request)) {
      return NextResponse.json(
        { success: false, error: 'Domain not allowed' },
        {
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Process the event
    const processedEvent = await processEvent(validatedData, request);

    // Save to database
    await saveEvent(processedEvent);

    return NextResponse.json({ success: true, type: 'permanent' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error saving event:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}