import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

const SUBSCRIPTION_BY_USER_TYPE: Record<string, { plan: string; price: number } | null> = {
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
 * POST /api/subscription/create
 * Create a subscription for a contractor
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

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

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const updatedUser = await updateUserById(userId, {
      subscription: {
        status: 'trial',
        plan: planInfo.plan,
        price: planInfo.price,
        trialEndsAt: trialEndDate.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedUser?.subscription || null,
      message: '30-day free trial activated! Start receiving leads now.',
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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

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
