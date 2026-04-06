import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

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
    const { userId, subscriptionData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
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
      willRenew,
      store,
    } = subscriptionData;

    const normalizedPlan = productId || user.subscription?.plan || 'contractor_pro';

    await updateUserById(userId, {
      subscription: {
        status: isTrial ? 'trial' : status || 'active',
        plan: normalizedPlan,
        price: normalizedPlan.includes('99') ? 99.99 : normalizedPlan === 'free' ? 0 : 49.99,
        trialEndsAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
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
