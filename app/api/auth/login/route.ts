import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory rate limiter: max 10 login attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function createFallbackToken(user: { id: string; email: string; userType: string }) {
  return Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      iss: 'buildvault-dev',
    })
  ).toString('base64url');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ipKey = getRateLimitKey(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(ipKey);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    console.info('[login-audit] login request received', {
      email: typeof email === 'string' ? email.toLowerCase() : email,
      hasPassword: Boolean(password),
      hasJWT_SECRET: Boolean(process.env.JWT_SECRET),
      hasDATABASE_URL: Boolean(process.env.DATABASE_URL),
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      xForwardedHost: request.headers.get('x-forwarded-host'),
      xForwardedProto: request.headers.get('x-forwarded-proto'),
    });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      console.info('[login-audit] login user lookup returned null', {
        email: typeof email === 'string' ? email.toLowerCase() : email,
        hasDATABASE_URL: Boolean(process.env.DATABASE_URL),
      });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.info('[login-audit] login user lookup succeeded', {
      email: user.email,
      userId: user.id,
      verified: user.verified,
      hasPasswordHash: Boolean(user.passwordHash),
      hasDATABASE_URL: Boolean(process.env.DATABASE_URL),
    });

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.verified) {
      console.warn('[login-audit] login blocked by unverified-user 403 branch', {
        email: user.email,
        userId: user.id,
        verified: user.verified,
        hasJWT_SECRET: Boolean(process.env.JWT_SECRET),
        hasDATABASE_URL: Boolean(process.env.DATABASE_URL),
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        xForwardedHost: request.headers.get('x-forwarded-host'),
        xForwardedProto: request.headers.get('x-forwarded-proto'),
      });
      return NextResponse.json(
        { success: false, error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Generate JWT token (fallback to dev token if JWT signing fails)
    let token: string;
    try {
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          userType: user.userType,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('JWT token generation failed, using fallback token:', tokenError);
      token = createFallbackToken(user);
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        phone: user.phone,
        isContractor: user.userType === 'contractor',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
