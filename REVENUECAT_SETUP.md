# RevenueCat Integration Guide

## Setup Instructions

### 1. Create RevenueCat Account
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a new account or sign in
3. Create a new project for "Construction Lead App"

### 2. Configure App in RevenueCat

#### iOS App Setup
1. In RevenueCat dashboard, go to **Apps** → **+ New App**
2. Select **iOS** platform
3. Enter your **Bundle ID** (from app.json)
4. Upload your **App Store Connect API Key**
5. Copy the **iOS API Key** shown

#### Android App Setup
1. Add another app for **Android**
2. Enter your **Package Name** (from app.json)
3. Upload your **Google Play Service Account JSON**
4. Copy the **Android API Key** shown

### 3. Create Products & Entitlements

#### Create Entitlement
1. Go to **Entitlements** → **+ New**
2. Name: `contractor_pro`
3. Description: "Contractor Pro Access"

#### Create Products
1. Go to **Products** → **+ New Product**
2. Create monthly subscription:
   - **Identifier**: `contractor_pro_monthly`
   - **Type**: Subscription
   - **Price**: $49.99/month
   - **Free Trial**: 30 days
   - **Attach to Entitlement**: `contractor_pro`

3. Create annual subscription (optional):
   - **Identifier**: `contractor_pro_annual`
   - **Type**: Subscription
   - **Price**: $499.99/year
   - **Free Trial**: 30 days
   - **Attach to Entitlement**: `contractor_pro`

#### Create Offering
1. Go to **Offerings** → **+ New**
2. Identifier: `default`
3. Add packages:
   - **Monthly**: contractor_pro_monthly
   - **Annual**: contractor_pro_annual (optional)
4. Set as **Current Offering**

### 4. Configure Environment Variables

Create a `.env` file in the mobile folder:

```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_api_key_here
```

### 5. Test Subscriptions

#### iOS Testing
1. Create a **Sandbox Tester** account in App Store Connect
2. Sign out of App Store on your device
3. Run the app and try subscribing
4. Sign in with sandbox account when prompted

#### Android Testing
1. Add test users in Google Play Console
2. Use internal testing track
3. Test purchase with test account

### 6. Webhook Setup (Optional)
1. In RevenueCat dashboard, go to **Integrations** → **Webhooks**
2. Add your backend webhook URL: `https://yourdomain.com/api/webhooks/revenuecat`
3. Enable events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`

## Code Integration

The RevenueCat service is already integrated in:
- `mobile/services/revenueCat.ts` - Main RevenueCat service
- `mobile/screens/ProfileScreen.tsx` - Subscription management UI
- `mobile/App.tsx` - SDK initialization

## Usage Examples

### Initialize SDK
```typescript
import { revenueCatService } from './services/revenueCat';

// On app start
await revenueCatService.initialize(userId);
```

### Start Free Trial
```typescript
const result = await revenueCatService.startFreeTrial();
if (result.success) {
  console.log('Trial started!');
}
```

### Check Subscription Status
```typescript
const status = await revenueCatService.getSubscriptionStatus();
console.log('Active:', status.isActive);
console.log('Trial:', status.isTrial);
console.log('Expires:', status.expiresAt);
```

### Restore Purchases
```typescript
const result = await revenueCatService.restorePurchases();
if (result.success) {
  console.log('Purchases restored!');
}
```

## Testing Without API Keys

The app includes mock subscription data when RevenueCat keys are not configured. This allows development and testing without a RevenueCat account.

## Pricing Structure

- **30-day free trial** for all new contractor accounts
- **$49.99/month** after trial ends
- **$499.99/year** (optional annual plan with 2 months free)

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [React Native SDK Guide](https://docs.revenuecat.com/docs/reactnative)
- [Testing Guide](https://docs.revenuecat.com/docs/testing-purchases)
- [Dashboard](https://app.revenuecat.com)
