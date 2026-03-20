import Stripe from 'stripe';
import type { SubscriptionInfo } from '../authStore';
import { logPlatformEvent } from '../eventLogger';
import { getAuthUserById, updateAuthUserProfile } from './authService';

const DEFAULT_PLAN = 'contractor_pro';
const DEFAULT_PRICE = Number(process.env.CONTRACTOR_MONTHLY_PRICE || 49);
const DEFAULT_TRIAL_DAYS = Number(process.env.CONTRACTOR_TRIAL_DAYS || 30);
const INTRO_PRICE = Number(process.env.CONTRACTOR_INTRO_PRICE || 39);
const INTRO_DAYS = Number(process.env.CONTRACTOR_INTRO_DAYS || 90);

export interface SubscriptionStatusResponse extends SubscriptionInfo {
  id: string;
  userId: string;
  daysRemaining?: number;
  createdAt?: string;
}

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-01-28.clover' });
}

function calculateFutureDate(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function calculateDaysRemaining(dateValue?: string): number | undefined {
  if (!dateValue) {
    return undefined;
  }

  return Math.max(0, Math.ceil((new Date(dateValue).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

function toRouteSubscription(userId: string, subscription: SubscriptionInfo): SubscriptionStatusResponse {
  return {
    id: subscription.stripeSubscriptionId || `sub_local_${userId}`,
    userId,
    status: subscription.status,
    plan: subscription.plan,
    price: subscription.price,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd ?? subscription.trialEndsAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
    daysRemaining: calculateDaysRemaining(subscription.currentPeriodEnd ?? subscription.trialEndsAt),
    introPrice: subscription.introPrice,
    standardPrice: subscription.standardPrice,
    introEndsAt: subscription.introEndsAt,
  };
}

function createLocalTrialSubscription(): SubscriptionInfo {
  const trialEndDate = calculateFutureDate(DEFAULT_TRIAL_DAYS).toISOString();
  const introEndDate = calculateFutureDate(INTRO_DAYS).toISOString();
  return {
    status: 'trial',
    plan: `${DEFAULT_PLAN}_intro`,
    price: INTRO_PRICE,
    trialEndsAt: trialEndDate,
    currentPeriodEnd: trialEndDate,
    introPrice: INTRO_PRICE,
    standardPrice: DEFAULT_PRICE,
    introEndsAt: introEndDate,
    cancelAtPeriodEnd: false,
  };
}

export async function createContractorSubscription(input: {
  userId: string;
  paymentMethodId?: string;
}): Promise<
  | { success: true; subscription: SubscriptionStatusResponse; message: string; note?: string }
  | { success: false; status: number; error: string }
> {
  const user = await getAuthUserById(input.userId);
  if (!user) {
    return { success: false, status: 404, error: 'User not found' };
  }

  if (user.userType !== 'contractor') {
    return { success: false, status: 400, error: 'Only contractors can create subscriptions' };
  }

  if (user.subscription && !input.paymentMethodId) {
    return {
      success: true,
      subscription: toRouteSubscription(user.id, user.subscription),
      message: 'Existing subscription found',
    };
  }

  const stripe = getStripeClient();
  const stripePriceId = process.env.STRIPE_PRICE_ID;

  if (stripe && stripePriceId && input.paymentMethodId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: { userId: user.id },
    });

    await stripe.paymentMethods.attach(input.paymentMethodId, {
      customer: customer.id,
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: input.paymentMethodId,
      },
    });

    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: stripePriceId }],
      trial_period_days: DEFAULT_TRIAL_DAYS,
    });

    const currentPeriodEnd = stripeSubscription.items.data[0]?.current_period_end
      ? new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString()
      : undefined;
    const trialEndsAt = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : currentPeriodEnd;

    const subscriptionInfo: SubscriptionInfo = {
      status: stripeSubscription.status === 'trialing' ? 'trial' : 'active',
      plan: `${DEFAULT_PLAN}_intro`,
      price: INTRO_PRICE,
      trialEndsAt,
      currentPeriodEnd,
      introPrice: INTRO_PRICE,
      standardPrice: DEFAULT_PRICE,
      introEndsAt: calculateFutureDate(INTRO_DAYS).toISOString(),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSubscription.id,
    };

    await updateAuthUserProfile(user.id, { subscription: subscriptionInfo });

    logPlatformEvent({
      type: 'user_profile_updated',
      entityType: 'user',
      entityId: user.id,
      metadata: {
        subscriptionEvent: 'created',
        provider: 'stripe',
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    return {
      success: true,
      subscription: toRouteSubscription(user.id, subscriptionInfo),
      message: `Free trial started. Intro pricing is $${INTRO_PRICE}/month for the first ${INTRO_DAYS} days, then $${DEFAULT_PRICE}/month.`,
    };
  }

  const localSubscription = createLocalTrialSubscription();
  await updateAuthUserProfile(user.id, { subscription: localSubscription });

  logPlatformEvent({
    type: 'user_profile_updated',
    entityType: 'user',
    entityId: user.id,
    metadata: {
      subscriptionEvent: 'created',
      provider: 'local',
    },
  });

  return {
    success: true,
    subscription: toRouteSubscription(user.id, localSubscription),
    message: `Free trial activated. Intro pricing is $${INTRO_PRICE}/month for the first ${INTRO_DAYS} days, then $${DEFAULT_PRICE}/month.`,
    note: stripe && !stripePriceId
      ? 'Set STRIPE_PRICE_ID to enable real Stripe subscriptions'
      : 'Configure STRIPE_SECRET_KEY and STRIPE_PRICE_ID for real payment processing',
  };
}

export async function getSubscriptionStatus(userId: string): Promise<
  | { success: true; subscription: SubscriptionStatusResponse | null }
  | { success: false; status: number; error: string }
> {
  const user = await getAuthUserById(userId);
  if (!user) {
    return { success: false, status: 404, error: 'User not found' };
  }

  return {
    success: true,
    subscription: user.subscription ? toRouteSubscription(user.id, user.subscription) : null,
  };
}

export async function cancelContractorSubscription(input: {
  userId: string;
  subscriptionId: string;
}): Promise<
  | { success: true; message: string; subscription: SubscriptionStatusResponse | null; note?: string }
  | { success: false; status: number; error: string }
> {
  const user = await getAuthUserById(input.userId);
  if (!user) {
    return { success: false, status: 404, error: 'User not found' };
  }

  if (!user.subscription) {
    return { success: false, status: 404, error: 'Subscription not found' };
  }

  const expectedSubscriptionId = user.subscription.stripeSubscriptionId || `sub_local_${user.id}`;
  if (input.subscriptionId !== expectedSubscriptionId) {
    return { success: false, status: 400, error: 'Subscription does not belong to user' };
  }

  const stripe = getStripeClient();
  if (stripe && user.subscription.stripeSubscriptionId) {
    const updatedStripeSubscription = await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const currentPeriodEnd = updatedStripeSubscription.items.data[0]?.current_period_end
      ? new Date(updatedStripeSubscription.items.data[0].current_period_end * 1000).toISOString()
      : user.subscription.currentPeriodEnd;
    const trialEndsAt = updatedStripeSubscription.trial_end
      ? new Date(updatedStripeSubscription.trial_end * 1000).toISOString()
      : user.subscription.trialEndsAt;

    const nextSubscription: SubscriptionInfo = {
      ...user.subscription,
      status: updatedStripeSubscription.status === 'canceled' ? 'canceled' : user.subscription.status,
      trialEndsAt,
      currentPeriodEnd,
      cancelAtPeriodEnd: updatedStripeSubscription.cancel_at_period_end,
    };

    await updateAuthUserProfile(user.id, { subscription: nextSubscription });

    logPlatformEvent({
      type: 'user_profile_updated',
      entityType: 'user',
      entityId: user.id,
      metadata: {
        subscriptionEvent: 'cancelled',
        provider: 'stripe',
        stripeSubscriptionId: updatedStripeSubscription.id,
      },
    });

    return {
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: toRouteSubscription(user.id, nextSubscription),
    };
  }

  const nextSubscription: SubscriptionInfo = {
    ...user.subscription,
    cancelAtPeriodEnd: true,
    status: 'canceled',
  };

  await updateAuthUserProfile(user.id, { subscription: nextSubscription });

  logPlatformEvent({
    type: 'user_profile_updated',
    entityType: 'user',
    entityId: user.id,
    metadata: {
      subscriptionEvent: 'cancelled',
      provider: 'local',
    },
  });

  return {
    success: true,
    message: 'Subscription cancelled',
    subscription: toRouteSubscription(user.id, nextSubscription),
    note: 'Configure STRIPE_SECRET_KEY and STRIPE_PRICE_ID for real payment processing',
  };
}