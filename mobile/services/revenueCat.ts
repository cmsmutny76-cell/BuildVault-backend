import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { syncSubscriptionToBackend } from './subscriptionSync';

// RevenueCat Configuration
const REVENUECAT_API_KEY = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'YOUR_IOS_API_KEY',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'YOUR_ANDROID_API_KEY',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  CONTRACTOR_PRO: 'contractor_pro_monthly',
  CONTRACTOR_PRO_ANNUAL: 'contractor_pro_annual',
};

class RevenueCatService {
  private initialized = false;
  private currentUserId?: string;

  /**
   * Initialize RevenueCat SDK
   * Call this once when the app starts
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Store user ID for syncing
      this.currentUserId = userId;

      // Determine platform
      const platform = this.getPlatform();
      const apiKey = platform === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;

      // Configure SDK
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      // Enable debug logs in development
      if (__DEV__) {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
      }

      this.initialized = true;
      console.log('RevenueCat initialized successfully');

      // Sync initial subscription state to backend
      if (userId) {
        const customerInfo = await this.getCustomerInfo();
        await this.syncToBackend(userId, customerInfo);
      }
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get current platform
   */
  private getPlatform(): 'ios' | 'android' {
    // In a real app, use Platform.OS from react-native
    // For now, default to iOS for development
    return 'ios';
  }

  /**
   * Identify user in RevenueCat
   */
  async login(userId: string): Promise<void> {
    try {
      this.currentUserId = userId;
      const { customerInfo } = await Purchases.logIn(userId);
      console.log('User logged in to RevenueCat:', userId);
      
      // Sync subscription state to backend
      await this.syncToBackend(userId, customerInfo);
    } catch (error) {
      console.error('RevenueCat login failed:', error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      this.currentUserId = undefined;
      console.log('User logged out from RevenueCat');
    } catch (error) {
      console.error('RevenueCat logout failed:', error);
    }
  }

  /**
   * Get available subscription offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        return offerings.current;
      }
      
      console.warn('No current offering available');
      return null;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }

  /**
   * Purchase a subscription package
   */
  async purchasePackage(packageIdentifier: string): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const offerings = await this.getOfferings();
      
      if (!offerings) {
        return { success: false, error: 'No offerings available' };
      }

      // Find the package
      const package_ = offerings.availablePackages.find(
        (pkg) => pkg.identifier === packageIdentifier
      );

      if (!package_) {
        return { success: false, error: 'Package not found' };
      }

      // Make purchase
      const { customerInfo } = await Purchases.purchasePackage(package_);
      
      // Sync to backend
      if (this.currentUserId) {
        await this.syncToBackend(this.currentUserId, customerInfo);
      }
      
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      // Check if user cancelled
      if (error.userCancelled) {
        return { success: false, error: 'Purchase cancelled' };
      }
      
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Start free trial (if configured in RevenueCat)
   */
  async startFreeTrial(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const offerings = await this.getOfferings();
      
      if (!offerings) {
        return { success: false, error: 'No offerings available' };
      }

      // Get the monthly package (should have trial configured)
      const monthlyPackage = offerings.monthly;
      
      if (!monthlyPackage) {
        return { success: false, error: 'Monthly package not available' };
      }

      // Purchase will automatically use trial if available
      const { customerInfo } = await Purchases.purchasePackage(monthlyPackage);
      
      // Sync to backend
      if (this.currentUserId) {
        await this.syncToBackend(this.currentUserId, customerInfo);
      }
      
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Trial signup failed:', error);
      
      if (error.userCancelled) {
        return { success: false, error: 'Trial signup cancelled' };
      }
      
      return { success: false, error: error.message || 'Trial signup failed' };
    }
  }

  /**
   * Get customer subscription info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      // Check if user has any active entitlements
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      return activeEntitlements.length > 0;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  /**
   * Check if user is in trial period
   */
  async isInTrialPeriod(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      // Check each active entitlement for trial status
      const entitlements = Object.values(customerInfo.entitlements.active);
      return entitlements.some((entitlement) => entitlement.periodType === 'trial');
    } catch (error) {
      console.error('Failed to check trial status:', error);
      return false;
    }
  }

  /**
   * Get subscription expiration date
   */
  async getExpirationDate(): Promise<Date | null> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      const entitlements = Object.values(customerInfo.entitlements.active);
      
      if (entitlements.length > 0 && entitlements[0].expirationDate) {
        return new Date(entitlements[0].expirationDate);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get expiration date:', error);
      return null;
    }
  }

  /**
   * Restore purchases (useful for new devices)
   */
  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      
      // Sync to backend
      if (this.currentUserId) {
        await this.syncToBackend(this.currentUserId, customerInfo);
      }
      
      return { success: true, customerInfo };
    } catch (error: any) {
      console.error('Restore purchases failed:', error);
      return { success: false, error: error.message || 'Restore failed' };
    }
  }

  /**
   * Sync subscription state to backend
   * Private helper method
   */
  private async syncToBackend(userId: string, customerInfo: CustomerInfo): Promise<void> {
    try {
      const result = await syncSubscriptionToBackend(userId, customerInfo);
      if (result.success) {
        console.log('Subscription synced to backend successfully');
      } else {
        console.warn('Failed to sync subscription to backend:', result.error);
      }
    } catch (error) {
      console.error('Error syncing subscription to backend:', error);
    }
  }

  /**
   * Get subscription status for display
   */
  async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    isTrial: boolean;
    expiresAt: Date | null;
    productIdentifier: string | null;
    willRenew: boolean;
  }> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const entitlements = Object.values(customerInfo.entitlements.active);
      
      if (entitlements.length === 0) {
        return {
          isActive: false,
          isTrial: false,
          expiresAt: null,
          productIdentifier: null,
          willRenew: false,
        };
      }

      const primaryEntitlement = entitlements[0];
      
      return {
        isActive: true,
        isTrial: primaryEntitlement.periodType === 'trial',
        expiresAt: primaryEntitlement.expirationDate ? new Date(primaryEntitlement.expirationDate) : null,
        productIdentifier: primaryEntitlement.productIdentifier,
        willRenew: primaryEntitlement.willRenew,
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        isActive: false,
        isTrial: false,
        expiresAt: null,
        productIdentifier: null,
        willRenew: false,
      };
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();
