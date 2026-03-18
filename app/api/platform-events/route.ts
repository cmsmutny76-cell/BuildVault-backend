import { NextRequest, NextResponse } from 'next/server';
import { countPlatformEvents, listPlatformEvents } from '../../../lib/eventLogger';

/**
 * GET /api/platform-events?limit=50
 * Read-only development view of recent platform events.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const parsedLimit = limitParam ? Number(limitParam) : 100;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 100;

    return NextResponse.json({
      success: true,
      events: await listPlatformEvents(limit),
      total: await countPlatformEvents(),
    });
  } catch (error) {
    console.error('List platform events error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list platform events' },
      { status: 500 }
    );
  }
}
