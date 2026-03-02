import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// TODO: Replace with actual database
const mockUsers = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
    if (!email || !password ||!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (mockUsers.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = 'user_' + Date.now();
    
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

    // Create user object
    const user = {
      id: userId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      address,
      city,
      state,
      zipCode,
      userType: userType || 'homeowner',
      ...(userType === 'contractor' && {
        businessName,
        licenseNumber,
        serviceAreas,
        specialties,
        subscription,
      }),
      createdAt: new Date(),
      verified: true, // TODO: Change to false and implement email verification
    };

    // Save user (currently in-memory, TODO: save to database)
    mockUsers.set(email.toLowerCase(), user);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isContractor: user.userType === 'contractor',
        subscription: subscription,
      },
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
