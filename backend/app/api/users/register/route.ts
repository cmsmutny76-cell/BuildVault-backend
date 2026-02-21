import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/users/register
 * Register a new user (homeowner or contractor)
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipCode,
      userType,
      // Contractor-specific fields
      businessName,
      licenseNumber,
      serviceAreas,
      specialties,
    } = userData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Hash password
    // TODO: Check if user exists
    // TODO: Save to database

    // For contractors, create trial subscription
    let subscription = null;
    if (userType === 'contractor') {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

      subscription = {
        status: 'trial',
        trialEndsAt: trialEndDate.toISOString(),
        plan: 'contractor_pro',
        price: 49.99,
      };
    }

    // Mock response
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      userType,
      ...(userType === 'contractor' && {
        businessName,
        licenseNumber,
        serviceAreas,
        specialties,
        subscription,
      }),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user,
      message: userType === 'contractor' 
        ? '30-day free trial activated! Start receiving leads today.'
        : 'Account created successfully!',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
