import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../../lib/email';
import { createUser, createVerificationToken, findUserByEmail, generateToken, type StoredUser } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// In-memory rate limiter: configurable max registrations per IP per time window
const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = parsePositiveInt(process.env.REGISTER_RATE_LIMIT_MAX, 20);
const RATE_LIMIT_WINDOW_MS = parsePositiveInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000);
const EMAIL_SEND_TIMEOUT_MS = parsePositiveInt(process.env.EMAIL_SEND_TIMEOUT_MS, 8000);

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = registerAttempts.get(key);

  if (!entry || now >= entry.resetAt) {
    registerAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

async function sendVerificationEmailWithTimeout(
  email: string,
  userId: string,
  verificationToken: string
) {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Verification email timed out after ${EMAIL_SEND_TIMEOUT_MS}ms`)), EMAIL_SEND_TIMEOUT_MS);
  });

  return Promise.race([
    sendVerificationEmail(email, userId, verificationToken),
    timeoutPromise,
  ]);
}

const INTRO_MONTHLY_PRICE = 10;
const INTRO_PERIOD_DAYS = 90;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const SUBSCRIPTION_PLANS: Record<string, { plan: string; standardPrice: number } | null> = {
  homeowner: null,
  employment_seeker: null,
  contractor: { plan: 'contractor_pro', standardPrice: 49.99 },
  supplier: null,
  commercial_builder: { plan: 'commercial_pro', standardPrice: 99.99 },
  multi_family_owner: { plan: 'commercial_pro', standardPrice: 99.99 },
  apartment_owner: { plan: 'commercial_pro', standardPrice: 99.99 },
  developer: { plan: 'commercial_pro', standardPrice: 99.99 },
  landscaper: { plan: 'landscaper_pro', standardPrice: 49.99 },
  school: { plan: 'school_pro', standardPrice: 49.99 },
};

/**
 * POST /api/users/register
 * Register a new user (homeowner or contractor)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipKey = getRateLimitKey(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(ipKey);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      );
    }

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
      supplierCategories,
      supplierAudience,
      supplierVisibilityRestricted,
      supplierDescription,
      supplierSpecialServices,
      customOrderMaterials,
    } = userData;

    // Validate required fields
    if (!email || !password ||!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
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
    
    // Create introductory discounted subscription for paid account types
    let subscription = null;
    if (subscriptionPlan) {
      const discountEndDate = new Date();
      discountEndDate.setDate(discountEndDate.getDate() + INTRO_PERIOD_DAYS);

      subscription = {
        status: 'active',
        discountEndsAt: discountEndDate.toISOString(),
        plan: subscriptionPlan.plan,
        price: INTRO_MONTHLY_PRICE,
        standardPrice: subscriptionPlan.standardPrice,
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
      ...((subscriptionPlan || normalizedUserType === 'supplier' || normalizedUserType === 'contractor') && {
        businessName,
        licenseNumber,
        serviceAreas,
        specialties,
        supplierCategories,
        supplierAudience,
        supplierVisibilityRestricted,
        supplierDescription,
        supplierSpecialServices,
        customOrderMaterials,
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

    // Do not block registration response on SMTP delivery latency.
    void sendVerificationEmailWithTimeout(email, userId, verificationToken)
      .then((emailResult) => {
        if (!emailResult.success) {
          console.error('Failed to send verification email, but user was created');
        }
      })
      .catch((error) => {
        console.error('Verification email send timed out/failed after registration:', error);
      });

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
        ? `90-day intro pricing activated at $10/month for ${subscriptionPlan.plan}! Please check your email to verify your account.`
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
