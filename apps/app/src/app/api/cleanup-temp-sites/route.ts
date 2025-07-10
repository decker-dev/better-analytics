import { type NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredTempSites } from '@/lib/temp-sites';

// GET route for Vercel cron jobs
export async function GET(request: NextRequest) {
  try {
    // Vercel cron authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedCount = await cleanupExpiredTempSites();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired temporary sites`
    });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}