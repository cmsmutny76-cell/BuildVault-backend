import { NextRequest, NextResponse } from 'next/server';

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
  
  // TODO: Update database
  // const subscription = {
  //   userId,
  //   productId,
  //   status: isTrial ? 'trial' : 'active',
  //   expiresAt: new Date(expirationMs),
  //   createdAt: new Date(),
  // };
  // await db.subscriptions.upsert(subscription);
  
  // TODO: Send welcome email
  // if (isTrial) {
  //   await sendTrialStartedEmail(userId);
  // } else {
  //   await sendSubscriptionStartedEmail(userId);
  // }
}

async function handleRenewal(
  userId: string,
  productId: string,
  expirationMs: number
) {
  console.log(`Renewal: User ${userId} subscription renewed until ${new Date(expirationMs)}`);
  
  // TODO: Update database
  // await db.subscriptions.update({
  //   where: { userId },
  //   data: {
  //     status: 'active',
  //     expiresAt: new Date(expirationMs),
  //     updatedAt: new Date(),
  //   },
  // });
}

async function handleCancellation(
  userId: string,
  expirationMs: number
) {
  console.log(`Cancellation: User ${userId} cancelled, access until ${new Date(expirationMs)}`);
  
  // TODO: Update database
  // await db.subscriptions.update({
  //   where: { userId },
  //   data: {
  //     status: 'cancelled',
  //     cancelledAt: new Date(),
  //     expiresAt: new Date(expirationMs), // Still has access until end of period
  //     updatedAt: new Date(),
  //   },
  // });
  
  // TODO: Send cancellation confirmation email
  // await sendCancellationEmail(userId, new Date(expirationMs));
}

async function handleExpiration(userId: string) {
  console.log(`Expiration: User ${userId} subscription expired`);
  
  // TODO: Update database
  // await db.subscriptions.update({
  //   where: { userId },
  //   data: {
  //     status: 'expired',
  //     updatedAt: new Date(),
  //   },
  // });
  
  // TODO: Send expiration email with re-subscribe CTA
  // await sendExpirationEmail(userId);
}

async function handleBillingIssue(userId: string) {
  console.log(`Billing issue: User ${userId} has a payment problem`);
  
  // TODO: Update database
  // await db.subscriptions.update({
  //   where: { userId },
  //   data: {
  //     status: 'past_due',
  //     updatedAt: new Date(),
  //   },
  // });
  
  // TODO: Send payment failure email
  // await sendPaymentFailedEmail(userId);
}
