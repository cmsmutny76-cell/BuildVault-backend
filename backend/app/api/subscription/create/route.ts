import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/subscription/create
 * Create a subscription for a contractor
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, paymentMethodId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Stripe (if API key is provided)
    const stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' })
      : null;

    if (stripe && paymentMethodId) {
      try {
        // TODO: Create a Price in Stripe Dashboard first, then use price ID
        // For now, use mock data until Stripe is fully configured with Products/Prices
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        
        return NextResponse.json({
          success: true,
          subscription: {
            id: 'sub_stripe_mock_' + Date.now(),
            status: 'trialing',
            trialEnd: trialEndDate.toISOString(),
            currentPeriodEnd: trialEndDate.toISOString(),
          },
          message: '30-day free trial started! You will not be charged until the trial ends.',
          note: 'Create a Product and Price in Stripe Dashboard to enable real payments',
        });
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        // Fall through to mock response
      }
    }

    // Mock subscription response (when Stripe is not configured)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const mockSubscription = {
      id: `sub_${Date.now()}`,
      userId,
      status: 'trial',
      plan: 'contractor_pro',
      price: 49.99,
      trialEndsAt: trialEndDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database

    return NextResponse.json({
      success: true,
      subscription: mockSubscription,
      message: '30-day free trial activated! Start receiving leads now.',
      note: 'Configure STRIPE_SECRET_KEY for real payment processing',
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

    // TODO: Fetch from database

    // Mock subscription status
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 20);

    const subscription = {
      id: 'sub_123456',
      userId,
      status: 'trial',
      plan: 'contractor_pro',
      price: 49.99,
      trialEndsAt: trialEndDate.toISOString(),
      daysRemaining: 20,
      currentPeriodEnd: trialEndDate.toISOString(),
      cancelAtPeriodEnd: false,
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
