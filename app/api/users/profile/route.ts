import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '../../../../lib/services/userProfileService';

/**
 * GET /api/users/profile?userId=123
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Partially update user profile.
 */
export async function PATCH(request: NextRequest) {
  try {
    const profileData = await request.json();
    const userId = typeof profileData.userId === 'string' ? profileData.userId : '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const profile = await updateUserProfile(profileData as Record<string, unknown>);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Compatibility alias for full update callers.
 */
export async function PUT(request: NextRequest) {
  return PATCH(request);
}
