import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Fetch from database

    // Mock user profile
    const userProfile = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      userType: 'contractor',
      businessName: 'ABC Construction LLC',
      licenseNumber: 'C-12345678',
      serviceAreas: ['90001', '90002', '90003'],
      specialties: ['Roofing', 'Flooring', 'Painting'],
      subscription: {
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 20,
        plan: 'contractor_pro',
        price: 49.99,
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
    const profileData = await request.json();

    // TODO: Validate data
    // TODO: Update database

    return NextResponse.json({
      success: true,
      profile: {
        ...profileData,
        updatedAt: new Date().toISOString(),
      },
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
