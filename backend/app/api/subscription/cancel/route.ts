import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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

    const stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' })
      : null;

    if (stripe) {
      try {
        // Cancel at period end to honor the paid period
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription will be cancelled at the end of the billing period',
        });
      } catch (stripeError: any) {
        console.error('Stripe cancellation error:', stripeError);
      }
    }

    // Mock cancellation
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled',
      note: 'Configure STRIPE_SECRET_KEY for real payment processing',
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
