import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the event data (in production, you'd save this to a database)
    console.log('📊 Analytics Event:', {
      event: body.event,
      props: body.props,
      timestamp: new Date(body.timestamp).toISOString(),
      url: body.url,
      referrer: body.referrer,
      userAgent: body.userAgent,
    });

    // In a real implementation, you would:
    // 1. Validate the event data
    // 2. Store it in your database (PostgreSQL, ClickHouse, etc.)
    // 3. Maybe send it to other analytics services
    // 4. Handle rate limiting and spam protection

    // Return 204 No Content (successful but no response body needed)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 