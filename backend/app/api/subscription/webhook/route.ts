import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { findUserByEmail, updateUserById } from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

const INTRO_MONTHLY_PRICE = 10;
const INTRO_PERIOD_DAYS = 90;

const PLAN_BY_KEY: Record<string, { plan: string; price: number }> = {
  pro49: { plan: 'contractor_pro', price: 49.99 },
  pro99: { plan: 'commercial_pro', price: 99.99 },
};

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

async function handleStripeCheckoutCompleted(stripe: Stripe, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.warn('Stripe checkout session missing userId metadata');
    return;
  }

  const selectedPlan = session.metadata?.planKey || 'pro49';
  const mappedPlan = PLAN_BY_KEY[selectedPlan] || PLAN_BY_KEY.pro49;

  const metadata = session.metadata || {};
  const parsedStandard = Number(metadata.standardPrice);
  const parsedIntro = Number(metadata.introPrice);
  const introEndsAt =
    metadata.introEndsAt || new Date(Date.now() + INTRO_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await updateUserById(userId, {
    subscription: {
      status: 'active',
      plan: mappedPlan.plan,
      price: Number.isFinite(parsedIntro) ? parsedIntro : INTRO_MONTHLY_PRICE,
      standardPrice: Number.isFinite(parsedStandard) ? parsedStandard : mappedPlan.price,
      discountEndsAt: introEndsAt,
    },
  });
}

async function handleStripeSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await updateUserById(userId, {
    subscription: {
      status: 'cancelled',
      plan: 'free',
      price: 0,
    },
  });
}

async function handleStripeInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  const email = invoice.customer_email;
  if (!email) return;

  const user = await findUserByEmail(email);
  if (!user) return;

  await updateUserById(user.id, {
    subscription: {
      status: 'past_due',
      plan: user.subscription?.plan || 'contractor_pro',
      price: user.subscription?.price || 49.99,
      standardPrice: user.subscription?.standardPrice,
      discountEndsAt: user.subscription?.discountEndsAt,
    },
  });
}

async function processStripeWebhook(request: NextRequest, signature: string) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured' },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature validation failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleStripeCheckoutCompleted(stripe, event);
      break;
    case 'customer.subscription.deleted':
      await handleStripeSubscriptionDeleted(event);
      break;
    case 'invoice.payment_failed':
      await handleStripeInvoicePaymentFailed(event);
      break;
    default:
      console.log('Unhandled Stripe event type:', event.type);
  }

  return NextResponse.json({ received: true, provider: 'stripe' });
}

/**
 * POST /api/subscription/webhook
 * RevenueCat webhook handler
 * 
 * Configure this endpoint in RevenueCat Dashboard:
 * https://app.revenuecat.com/projects/your-project/integrations/webhooks
 * 
 * Events we care about:
 * - INITIAL_PURCHASE: User subscribes for the first time
 * - RENEWAL: Subscription renewed
 * - CANCELLATION: User cancels subscription
 * - EXPIRATION: Subscription expired
 * - BILLING_ISSUE: Payment failed
 */
export async function POST(request: NextRequest) {
  try {
    const stripeSignature = request.headers.get('stripe-signature');
    if (stripeSignature) {
      return processStripeWebhook(request, stripeSignature);
    }

    const event = await request.json();
    
    console.log('RevenueCat webhook received:', event.type);
    
    const {
      type,
      app_user_id,
      product_id,
      period_type,
      purchased_at_ms,
      expiration_at_ms,
      is_trial_period,
      store,
    } = event;

    // Verify webhook authenticity (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.REVENUECAT_WEBHOOK_SECRET;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      console.warn('Invalid webhook authorization');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle different event types
    switch (type) {
      case 'INITIAL_PURCHASE':
        await handleInitialPurchase(app_user_id, product_id, is_trial_period, expiration_at_ms);
        break;
        
      case 'RENEWAL':
        await handleRenewal(app_user_id, product_id, expiration_at_ms);
        break;
        
      case 'CANCELLATION':
        await handleCancellation(app_user_id, expiration_at_ms);
        break;
        
      case 'EXPIRATION':
        await handleExpiration(app_user_id);
        break;
        
      case 'BILLING_ISSUE':
        await handleBillingIssue(app_user_id);
        break;
        
      default:
        console.log('Unhandled event type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleInitialPurchase(
  userId: string,
  productId: string,
  isTrial: boolean,
  expirationMs: number
) {
  console.log(`Initial purchase: User ${userId} subscribed to ${productId}${isTrial ? ' (trial)' : ''}`);

  await updateUserById(userId, {
    subscription: {
      status: 'active',
      plan: productId,
      price: isTrial ? INTRO_MONTHLY_PRICE : productId.includes('99') ? 99.99 : 49.99,
      standardPrice: productId.includes('99') ? 99.99 : 49.99,
      discountEndsAt: isTrial && expirationMs ? new Date(expirationMs).toISOString() : undefined,
    },
  });
}

async function handleRenewal(
  userId: string,
  productId: string,
  expirationMs: number
) {
  console.log(`Renewal: User ${userId} subscription renewed until ${new Date(expirationMs)}`);

  await updateUserById(userId, {
    subscription: {
      status: 'active',
      plan: productId,
      price: productId.includes('99') ? 99.99 : 49.99,
      standardPrice: productId.includes('99') ? 99.99 : 49.99,
      discountEndsAt: undefined,
    },
  });
}

async function handleCancellation(
  userId: string,
  expirationMs: number
) {
  console.log(`Cancellation: User ${userId} cancelled, access until ${new Date(expirationMs)}`);

  await updateUserById(userId, {
    subscription: {
      status: 'cancelled',
      plan: 'free',
      price: 0,
      discountEndsAt: expirationMs ? new Date(expirationMs).toISOString() : undefined,
    },
  });
}

async function handleExpiration(userId: string) {
  console.log(`Expiration: User ${userId} subscription expired`);

  await updateUserById(userId, {
    subscription: {
      status: 'expired',
      plan: 'free',
      price: 0,
    },
  });
}

async function handleBillingIssue(userId: string) {
  console.log(`Billing issue: User ${userId} has a payment problem`);

  await updateUserById(userId, {
    subscription: {
      status: 'past_due',
      plan: 'contractor_pro',
      price: 49.99,
    },
  });
}
