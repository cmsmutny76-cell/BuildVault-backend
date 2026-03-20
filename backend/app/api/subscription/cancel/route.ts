import { NextRequest, NextResponse } from 'next/server';
import { cancelContractorSubscription } from '../../../../lib/services/subscriptionService';

/**
 * POST /api/subscription/cancel
 * Cancel a subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId } = await request.json();

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'User ID and Subscription ID are required' },
        { status: 400 }
      );
    }

    const result = await cancelContractorSubscription({ userId, subscriptionId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
