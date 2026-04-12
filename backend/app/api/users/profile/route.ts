import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicProfileByUserId, updatePublicProfile } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

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

/**
 * GET /api/users/profile?userId=123
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const requestedUserId = searchParams.get('userId');
    const authenticatedUserId = getAuthenticatedUserId(request);

    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = requestedUserId || authenticatedUserId;

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userProfile = await getPublicProfileByUserId(userId);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profileData = await request.json();
    const payloadUserId = profileData.userId || profileData.id;

    if (!payloadUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (payloadUserId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    const normalizedProfileData = {
      ...profileData,
      userId: payloadUserId,
      id: payloadUserId,
    };

    const updatedProfile = await updatePublicProfile(normalizedProfileData);

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Update user profile (alias for PUT, used by mobile clients)
 */
export async function PATCH(request: NextRequest) {
  return PUT(request);
}
