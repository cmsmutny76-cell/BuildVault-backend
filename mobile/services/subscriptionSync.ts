import { CustomerInfo } from 'react-native-purchases';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Sync subscription state from RevenueCat to backend
 * Call this after successful purchase/restore
 */
export async function syncSubscriptionToBackend(
  userId: string,
  customerInfo: CustomerInfo
): Promise<{ success: boolean; error?: string }> {
  try {
    const entitlements = Object.values(customerInfo.entitlements.active);
    
    if (entitlements.length === 0) {
      // No active subscription, sync that too
      await fetch(`${API_BASE_URL}/api/subscription/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscriptionData: {
            status: 'none',
            expiresAt: null,
          },
        }),
      });
      return { success: true };
    }

    const primaryEntitlement = entitlements[0];
    
    const subscriptionData = {
      userId,
      subscriptionData: {
        productId: primaryEntitlement.productIdentifier,
        status: primaryEntitlement.periodType === 'trial' ? 'trial' : 'active',
        isTrial: primaryEntitlement.periodType === 'trial',
        expiresAt: primaryEntitlement.expirationDate || null,
        willRenew: primaryEntitlement.willRenew,
        store: primaryEntitlement.store,
      },
    };

    const response = await fetch(`${API_BASE_URL}/api/subscription/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Sync failed' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to sync subscription to backend:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Fetch subscription status from backend
 * Use as fallback or for web dashboard
 */
export async function fetchSubscriptionFromBackend(
  userId: string
): Promise<{
  success: boolean;
  subscription?: any;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/subscription/status?userId=${userId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error };
    }

    const data = await response.json();
    return { success: true, subscription: data.subscription };
  } catch (error: any) {
    console.error('Failed to fetch subscription from backend:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}
