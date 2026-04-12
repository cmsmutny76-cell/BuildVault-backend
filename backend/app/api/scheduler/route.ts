import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSchedulerState, saveSchedulerState, type SchedulerState } from '../../../lib/services/schedulerService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getAuthenticatedUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId?: string };
    return typeof decoded.userId === 'string' ? decoded.userId : null;
  } catch {
    // Dev fallback token support from auth/login route
    try {
      const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
        userId?: string;
        exp?: number;
      };

      if (typeof parsed.exp === 'number' && Date.now() > parsed.exp) {
        return null;
      }

      return typeof parsed.userId === 'string' ? parsed.userId : null;
    } catch {
      return null;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const userId = requestedUserId || authenticatedUserId;

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden: user mismatch' }, { status: 403 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const state = await getSchedulerState(userId);
    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error('Scheduler GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load scheduler state' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = typeof data?.userId === 'string' ? data.userId.trim() : '';
    const state = data?.state as SchedulerState | undefined;

    if (!userId || !state || !Array.isArray(state.projects) || !Array.isArray(state.tasks)) {
      return NextResponse.json({ success: false, error: 'Valid userId and state are required' }, { status: 400 });
    }

    if (userId !== authenticatedUserId) {
      return NextResponse.json({ success: false, error: 'Forbidden: user mismatch' }, { status: 403 });
    }

    const saved = await saveSchedulerState(userId, state);
    return NextResponse.json({ success: true, state: saved });
  } catch (error) {
    console.error('Scheduler PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save scheduler state' }, { status: 500 });
  }
}
