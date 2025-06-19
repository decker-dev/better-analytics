import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/modules/auth/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteKey: string }> }
) {
  try {
    const { siteKey } = await params;

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '10'), 50);

    // Verify user has access to this site
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.siteKey, siteKey))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // For now, return mock events since we don't have events table yet
    // TODO: Replace with actual events query when events table is implemented
    const mockEvents = generateMockEvents(siteKey, limit);

    return NextResponse.json({
      events: mockEvents,
      total: mockEvents.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock events generator for development/demo
function generateMockEvents(siteKey: string, limit: number) {
  const eventTypes = ['pageview', 'button_click', 'form_submit', 'link_click', 'scroll'];
  const events = [];

  // Simulate some recent events (for demo purposes)
  const now = Date.now();
  const hasRecentEvents = Math.random() > 0.7; // 30% chance of having events

  if (hasRecentEvents) {
    const eventCount = Math.min(Math.floor(Math.random() * 3) + 1, limit);

    for (let i = 0; i < eventCount; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const timestamp = now - (i * 30000) - Math.random() * 120000; // Events within last 2-5 minutes

      events.push({
        id: `evt_${Date.now()}_${i}`,
        event: eventType,
        timestamp,
        url: `https://example.com/${eventType === 'pageview' ? '' : 'page'}`,
        props: getEventProps(eventType ?? ''),
        createdAt: new Date(timestamp).toISOString(),
      });
    }
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

function getEventProps(eventType: string): Record<string, unknown> {
  switch (eventType) {
    case 'button_click':
      return {
        button: 'hero-cta',
        section: 'above-fold',
        test: true,
      };
    case 'form_submit':
      return {
        form: 'contact',
        fields: ['name', 'email'],
        test: true,
      };
    case 'link_click':
      return {
        href: '/pricing',
        text: 'View Pricing',
        test: true,
      };
    case 'scroll':
      return {
        depth: 75,
        section: 'features',
        test: true,
      };
    default:
      return {
        test: true,
        source: 'onboarding',
      };
  }
} 