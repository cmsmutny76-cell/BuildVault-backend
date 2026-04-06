import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findUserById, updateUserById } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

type PlanKey = 'free' | 'pro49' | 'pro99';

const USER_PLAN_BY_TYPE: Record<string, PlanKey> = {
  homeowner: 'free',
  employment_seeker: 'free',
  contractor: 'pro49',
  landscaper: 'pro49',
  school: 'pro49',
  commercial_builder: 'pro99',
  multi_family_owner: 'pro99',
  apartment_owner: 'pro99',
  developer: 'pro99',
};

const PLAN_META: Record<Exclude<PlanKey, 'free'>, { plan: string; price: number }> = {
  pro49: { plan: 'contractor_pro', price: 49.99 },
  pro99: { plan: 'commercial_pro', price: 99.99 },
};

function getDefaultPlanKey(userType: string): PlanKey {
  return USER_PLAN_BY_TYPE[userType] || 'free';
}

function getPriceIdForPlan(planKey: Exclude<PlanKey, 'free'>): string | null {
  if (planKey === 'pro49') {
    return process.env.STRIPE_PRICE_49_MONTHLY || process.env.STRIPE_PRICE_CONTRACTOR || null;
  }
  return process.env.STRIPE_PRICE_99_MONTHLY || process.env.STRIPE_PRICE_PROFESSIONAL || null;
}

function resolveAppUrl(request: NextRequest) {
  return request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  try {
    const { userId, planKey } = (await request.json()) as { userId?: string; planKey?: PlanKey };

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const requestedPlan = planKey || getDefaultPlanKey(user.userType);

    if (requestedPlan === 'free') {
      await updateUserById(userId, {
        subscription: {
          status: 'active',
          plan: 'free',
          price: 0,
        },
      });

      return NextResponse.json({
        success: true,
        freeActivated: true,
        redirectUrl: '/pricing/success?free=1',
      });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured (missing STRIPE_SECRET_KEY).' },
        { status: 400 }
      );
    }

    const priceId = getPriceIdForPlan(requestedPlan);
    if (!priceId) {
      return NextResponse.json(
        { success: false, error: `Stripe price ID is missing for plan ${requestedPlan}.` },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2026-01-28.clover' });
    const appUrl = resolveAppUrl(request);
    const meta = PLAN_META[requestedPlan];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planKey: requestedPlan,
        planName: meta.plan,
      },
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          userId: user.id,
          planKey: requestedPlan,
          planName: meta.plan,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ success: false, error: 'Failed to create checkout session.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, redirectUrl: session.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to start checkout.' }, { status: 500 });
  }
}