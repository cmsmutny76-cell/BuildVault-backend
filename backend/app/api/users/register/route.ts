import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../../lib/email';
import { createUser, createVerificationToken, findUserByEmail, generateToken, type StoredUser } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const SUBSCRIPTION_PLANS: Record<string, { plan: string; price: number } | null> = {
  homeowner: null,
  employment_seeker: null,
  contractor: { plan: 'contractor_pro', price: 49.99 },
  commercial_builder: { plan: 'commercial_pro', price: 99.99 },
  multi_family_owner: { plan: 'commercial_pro', price: 99.99 },
  apartment_owner: { plan: 'commercial_pro', price: 99.99 },
  developer: { plan: 'commercial_pro', price: 99.99 },
  landscaper: { plan: 'landscaper_pro', price: 49.99 },
  school: { plan: 'school_pro', price: 49.99 },
};

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
    if (await findUserByEmail(email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const normalizedUserType = userType || 'homeowner';
    const subscriptionPlan = SUBSCRIPTION_PLANS[normalizedUserType];

    if (!(normalizedUserType in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Create user
    const userId = 'user_' + Date.now();
    
    // Create trial subscription for paid account types
    let subscription = null;
    if (subscriptionPlan) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

      subscription = {
        status: 'trial',
        trialEndsAt: trialEndDate.toISOString(),
        plan: subscriptionPlan.plan,
        price: subscriptionPlan.price,
      };
    }

    // Create user object
    const user: StoredUser = {
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
      userType: normalizedUserType,
      ...(subscriptionPlan && {
        businessName,
        licenseNumber,
        serviceAreas,
        specialties,
        subscription,
      }),
      createdAt: new Date().toISOString(),
      verified: false, // Require email verification
      updatedAt: new Date().toISOString(),
    };

    // Generate verification token
    const verificationToken = generateToken();

    await createVerificationToken(verificationToken, {
      userId,
      email: email.toLowerCase(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await createUser(user);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, userId, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email, but user was created');
    }

    // Generate JWT token (but user still needs to verify email to login)
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
        verified: user.verified,
      },
      message: subscriptionPlan
        ? `30-day free trial activated for ${subscriptionPlan.plan}! Please check your email to verify your account.`
        : 'Account created successfully! Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
