# Subscription Architecture

## Overview

The app uses **RevenueCat** as the single source of truth for subscription management. RevenueCat handles:
- App Store and Play Store billing
- Subscription lifecycle (purchases, renewals, cancellations)
- Free trial management
- Cross-platform receipt validation

The **backend** maintains a synchronized copy of subscription state for:
- Server-side entitlement checks
- Analytics and reporting
- Webhook-triggered business logic (emails, notifications)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  RevenueCat SDK                                           │  │
│  │  - Handles purchases                                      │  │
│  │  - Manages entitlements                                   │  │
│  │  - Validates receipts                                     │  │
│  └─────────────┬─────────────────────────────────────────────┘  │
│                │                                                 │
│                │ After purchase/restore                          │
│                ▼                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  subscriptionSync.ts                                      │  │
│  │  - syncSubscriptionToBackend()                            │  │
│  └─────────────┬─────────────────────────────────────────────┘  │
└────────────────┼─────────────────────────────────────────────────┘
                 │
                 │ POST /api/subscription/sync
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/subscription/sync                                   │  │
│  │  - Receives subscription state from mobile                │  │
│  │  - Updates database                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/subscription/webhook                                │  │
│  │  - Receives events from RevenueCat                        │  │
│  │  - Handles: INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc │  │
│  │  - Sends emails, updates database                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/subscription/status                                 │  │
│  │  - Query subscription status for user                     │  │
│  │  - Used by server-side code for entitlement checks       │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────▲───────────────────────────────────────────┘
                       │
                       │ Webhooks
                       │
           ┌───────────┴────────────┐
           │   RevenueCat Server    │
           │   - Sends events when  │
           │     purchases happen   │
           └────────────────────────┘
```

## Data Flow

### 1. Purchase Flow
```
User → App Store/Play Store → RevenueCat → Mobile App → Backend
                                              │
                                              ▼
                                        Update UI
                                              │
                                              ▼
                                   POST /api/subscription/sync
                                              │
                                              ▼
                                      Update Database
```

### 2. Webhook Flow (Background)
```
App Store/Play Store → RevenueCat → POST /api/subscription/webhook
                                              │
                                              ▼
                                      Update Database
                                              │
                                              ▼
                                       Send Email
```

### 3. Status Check Flow
```
Server Code → GET /api/subscription/status?userId=xxx → Database
                                              │
                                              ▼
                                      Return Status
```

## API Endpoints

### POST /api/subscription/sync
**Called by mobile app** after successful purchase, restore, or app launch.

Request:
```json
{
  "userId": "user_123",
  "subscriptionData": {
    "productId": "contractor_pro_monthly",
    "status": "trial",
    "isTrial": true,
    "expiresAt": "2026-04-15T10:30:00Z",
    "willRenew": true,
    "store": "app_store"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Subscription synced successfully"
}
```

### POST /api/subscription/webhook
**Called by RevenueCat** when subscription events occur.

Request (example INITIAL_PURCHASE):
```json
{
  "type": "INITIAL_PURCHASE",
  "app_user_id": "user_123",
  "product_id": "contractor_pro_monthly",
  "period_type": "trial",
  "purchased_at_ms": 1710501000000,
  "expiration_at_ms": 1713093000000,
  "is_trial_period": true,
  "store": "app_store"
}
```

Response:
```json
{
  "received": true
}
```

### GET /api/subscription/status?userId=xxx
**Query subscription status** from backend.

Response:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123456",
    "userId": "user_123",
    "status": "trial",
    "plan": "contractor_pro",
    "price": 49.99,
    "trialEndsAt": "2026-04-15T10:30:00Z",
    "daysRemaining": 20,
    "currentPeriodEnd": "2026-04-15T10:30:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

### POST /api/subscription/create
**Legacy endpoint** - Creates mock subscription. Will be deprecated once RevenueCat is fully configured.

### POST /api/subscription/cancel
**Legacy endpoint** - Handles cancellation via Stripe. Consider using RevenueCat dashboard for cancellations.

## Mobile Implementation

### Initialize RevenueCat
```typescript
import { revenueCatService } from './services/revenueCat';

// In App.tsx or main entry point
await revenueCatService.initialize(userId);
```

### Start Free Trial
```typescript
const result = await revenueCatService.startFreeTrial();
if (result.success) {
  // Subscription automatically synced to backend
  alert('Trial started!');
}
```

### Purchase Subscription
```typescript
const result = await revenueCatService.purchasePackage('contractor_pro_monthly');
if (result.success) {
  // Subscription automatically synced to backend
  alert('Thanks for subscribing!');
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
  // Subscription automatically synced to backend
  alert('Purchases restored!');
}
```

## Backend Implementation

### Database Schema

```typescript
// TODO: Create this schema in your database
interface Subscription {
  id: string;
  userId: string;
  productId: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due';
  isTrial: boolean;
  expiresAt: Date | null;
  willRenew: boolean;
  store: 'app_store' | 'play_store';
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Check Entitlement Server-Side

```typescript
// Example: Check if user can post unlimited projects
async function canUserPostUnlimitedProjects(userId: string): Promise<boolean> {
  const response = await fetch(`/api/subscription/status?userId=${userId}`);
  const { subscription } = await response.json();
  
  if (!subscription) return false;
  
  // Check if subscription is active or trialing
  return subscription.status === 'active' || subscription.status === 'trial';
}
```

## Setup Instructions

### 1. RevenueCat Configuration

1. Create account at https://app.revenuecat.com
2. Create a new project
3. Add iOS app with App Store Connect API key
4. Add Android app with Play Store service credentials
5. Create products in RevenueCat dashboard matching App Store/Play Store products
6. Create entitlements (e.g., "pro_features")
7. Attach products to entitlements

### 2. Environment Variables

Add to `.env.local` (backend):
```bash
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
```

Add to mobile app `.env`:
```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Configure Webhook in RevenueCat

1. Go to RevenueCat Dashboard → Project Settings → Integrations → Webhooks
2. Add webhook URL: `https://your-domain.com/api/subscription/webhook`
3. Set authorization header: `Bearer your_webhook_secret_here`
4. Select events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE

### 4. Test Sandbox Purchases

**iOS:**
1. Use Sandbox tester account in App Store Connect
2. Sign out of App Store on device/simulator
3. When prompted during purchase, sign in with sandbox account

**Android:**
1. Add test account in Play Console → License testing
2. Use that account on test device

## Source of Truth Decision

**RevenueCat is the single source of truth** because:
- It directly validates receipts with Apple/Google
- It handles complex subscription logic (grace periods, introductory prices, etc.)
- It provides cross-platform consistency
- Backend can always query RevenueCat REST API if sync fails

**Backend database is a cache** that:
- Improves performance (no need to query RevenueCat on every request)
- Enables server-side entitlement checks without API calls
- Supports analytics and reporting
- Gets updated via sync and webhooks

## Troubleshooting

### Mobile app shows no subscription, but backend has it
- **Cause:** RevenueCat hasn't synced properly
- **Fix:** Call `revenueCatService.restorePurchases()` to re-sync

### Backend webhook not receiving events
- **Cause:** Webhook URL not configured or unreachable
- **Fix:** Check RevenueCat dashboard webhook logs and ensure HTTPS endpoint is publicly accessible

### User purchased but can't access features
- **Cause:** Sync failed or backend not checking subscription
- **Fix:** Check logs in `/api/subscription/sync` and ensure feature gates call `hasActiveSubscription()`

### Trial doesn't work
- **Cause:** Trial not configured in App Store/Play Store product
- **Fix:** Ensure product has free trial period configured in respective store console

## Migration Path

Current state: Mock data in both mobile and backend

**Phase 1 (Complete):**
- ✅ RevenueCat SDK integrated in mobile
- ✅ Sync endpoint created
- ✅ Webhook endpoint created
- ✅ Auto-sync after purchases

**Phase 2 (Next):**
- [ ] Create database schema for subscriptions
- [ ] Update `/api/subscription/status` to read from database
- [ ] Deploy webhook endpoint to production
- [ ] Configure webhook in RevenueCat dashboard
- [ ] Test end-to-end flow in sandbox

**Phase 3 (Future):**
- [ ] Implement email notifications (trial started, renewal, cancellation)
- [ ] Add analytics dashboard for subscription metrics
- [ ] Implement grace period handling
- [ ] Add promotional codes support
- [ ] Implement subscription management UI (upgrade/downgrade)
