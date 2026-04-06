import { NextResponse } from 'next/server';
import { getPublicProfileByUserId, updatePublicProfile } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

/**
 * GET /api/users/profile?userId=123
 * Get user profile
 */
export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get('userId');

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
export async function PUT(request: Request) {
  try {
    const profileData = await request.json();

    const updatedProfile = await updatePublicProfile(profileData);

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
export async function PATCH(request: Request) {
  return PUT(request);
}
