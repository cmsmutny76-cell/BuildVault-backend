import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

const INTRO_MONTHLY_PRICE = 10;
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

function getPlanAndStandardPrice(userType: string, productId?: string, existingPlan?: string) {
  const userTypePlan = SUBSCRIPTION_BY_USER_TYPE[userType];

  if (!userTypePlan) {
    return { plan: 'free', standardPrice: 0 };
  }

  const plan = productId || existingPlan || userTypePlan.plan;

  if (plan === 'free') {
    return { plan, standardPrice: 0 };
  }

  if (/commercial|multi|apartment|developer|99/i.test(plan)) {
    return { plan, standardPrice: 99.99 };
  }

  if (/contractor|landscaper|school|49/i.test(plan)) {
    return { plan, standardPrice: 49.99 };
  }

  return { plan, standardPrice: userTypePlan.standardPrice };
}

/**
 * POST /api/subscription/sync
 * Sync subscription state from mobile app (RevenueCat) to backend
 * 
 * This is called by the mobile app after:
 * - Successful purchase
 * - Restore purchases
 * - App launch (to keep backend in sync)
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

    const { userId, subscriptionData } = await request.json();

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

    console.log(`Syncing subscription for user ${userId}:`, subscriptionData);

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (subscriptionData.status === 'none') {
      await updateUserById(userId, {
        subscription: {
          status: 'expired',
          plan: 'free',
          price: 0,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'Subscription status synced (none)',
      });
    }

    // User has active subscription from RevenueCat
    const {
      productId,
      status,
      isTrial,
      expiresAt,
    } = subscriptionData;

    const { plan, standardPrice } = getPlanAndStandardPrice(
      user.userType,
      productId,
      user.subscription?.plan
    );

    await updateUserById(userId, {
      subscription: {
        status: status === 'none' ? 'expired' : 'active',
        plan,
        price: isTrial && standardPrice > 0 ? INTRO_MONTHLY_PRICE : standardPrice,
        standardPrice,
        discountEndsAt: isTrial && expiresAt ? new Date(expiresAt).toISOString() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
    });
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
