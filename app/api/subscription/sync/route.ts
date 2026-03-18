import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Validate user exists
    // const user = await db.users.findUnique({ where: { id: userId } });
    // if (!user) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // }

    if (subscriptionData.status === 'none') {
      // User has no active subscription
      // TODO: Update database
      // await db.subscriptions.update({
      //   where: { userId },
      //   data: {
      //     status: 'expired',
      //     updatedAt: new Date(),
      //   },
      // });
      
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

    // TODO: Upsert to database
    // await db.subscriptions.upsert({
    //   where: { userId },
    //   create: {
    //     userId,
    //     productId,
    //     status,
    //     isTrial,
    //     expiresAt: expiresAt ? new Date(expiresAt) : null,
    //     willRenew,
    //     store,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    //   update: {
    //     productId,
    //     status,
    //     isTrial,
    //     expiresAt: expiresAt ? new Date(expiresAt) : null,
    //     willRenew,
    //     store,
    //     updatedAt: new Date(),
    //   },
    // });

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
