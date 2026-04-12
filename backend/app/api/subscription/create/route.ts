import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

const INTRO_MONTHLY_PRICE = 10;
const INTRO_PERIOD_DAYS = 90;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const SUBSCRIPTION_BY_USER_TYPE: Record<string, { plan: string; standardPrice: number } | null> = {
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
 * POST /api/subscription/create
 * Create a subscription for a contractor
 */
export async function POST(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const planInfo = SUBSCRIPTION_BY_USER_TYPE[user.userType];

    if (!planInfo) {
      const updatedUser = await updateUserById(userId, {
        subscription: {
          status: 'active',
          plan: 'free',
          price: 0,
        },
      });

      return NextResponse.json({
        success: true,
        subscription: updatedUser?.subscription || null,
        message: 'Free access is active for this account type.',
      });
    }

    const discountEndDate = new Date();
    discountEndDate.setDate(discountEndDate.getDate() + INTRO_PERIOD_DAYS);

    const updatedUser = await updateUserById(userId, {
      subscription: {
        status: 'active',
        plan: planInfo.plan,
        price: INTRO_MONTHLY_PRICE,
        standardPrice: planInfo.standardPrice,
        discountEndsAt: discountEndDate.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedUser?.subscription || null,
      message: '90-day intro pricing activated at $10/month.',
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/status?userId=123
 * Get subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedUserId = getAuthenticatedUserId(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    const userId = requestedUserId || authenticatedUserId;

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Forbidden: user mismatch' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await findUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subscription = user.subscription || {
      status: 'none',
      plan: 'free',
      price: 0,
    };

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
