import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

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

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
      : null;

    if (stripe) {
      try {
        // Cancel at period end to honor the paid period
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });

        await updateUserById(userId, {
          subscription: {
            status: 'cancelled',
            plan: user.subscription?.plan || 'contractor_pro',
            price: user.subscription?.price || 49.99,
            standardPrice: user.subscription?.standardPrice,
            discountEndsAt: user.subscription?.discountEndsAt,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription will be cancelled at the end of the billing period',
        });
      } catch (stripeError: any) {
        console.error('Stripe cancellation error:', stripeError);
      }
    }

    await updateUserById(userId, {
      subscription: {
        status: 'cancelled',
        plan: user.subscription?.plan || 'contractor_pro',
        price: user.subscription?.price || 49.99,
        standardPrice: user.subscription?.standardPrice,
        discountEndsAt: user.subscription?.discountEndsAt,
      },
    });

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
