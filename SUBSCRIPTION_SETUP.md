# Subscription Setup Quick Start

## What Changed

The app now has a **unified subscription system** with RevenueCat as the single source of truth:

1. **Mobile App** uses RevenueCat SDK for purchases
2. **Automatic Sync** to backend after every purchase/restore
3. **Webhook Integration** for background updates from RevenueCat
4. **Backend API** maintains synchronized subscription state

## Files Added/Modified

### Backend (New Files)
- `backend/app/api/subscription/webhook/route.ts` - RevenueCat webhook handler
- `backend/app/api/subscription/sync/route.ts` - Manual sync endpoint

### Mobile (Modified Files)
- `mobile/services/revenueCat.ts` - Added auto-sync after purchases
- `mobile/services/subscriptionSync.ts` - Sync helper functions (NEW)

### Documentation
- `SUBSCRIPTION_ARCHITECTURE.md` - Complete architecture documentation

## Setup Steps

### 1. Configure RevenueCat (Required for Production)

**Create RevenueCat Account:**
```
1. Go to https://app.revenuecat.com
2. Create project
3. Add iOS app (Bundle ID: com.yourcompany.constructionleads)
4. Add Android app (Package: com.yourcompany.constructionleads)
5. Copy API keys
```

**Add Environment Variables:**

Mobile (`.env`):
```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
EXPO_PUBLIC_API_URL=http://localhost:3000  # Change for production
```

Backend (`.env.local`):
```bash
REVENUECAT_WEBHOOK_SECRET=your_secret_here_use_random_string
```

**Configure Products in RevenueCat:**
```
1. Create Entitlement: "pro_features"
2. Create Product: "contractor_pro_monthly" → $49.99/month with 30-day trial
3. Create Product: "contractor_pro_annual" → $499.99/year
4. Attach products to "pro_features" entitlement
```

**Configure Webhook:**
```
1. RevenueCat Dashboard → Integrations → Webhooks
2. URL: https://your-domain.com/api/subscription/webhook
3. Authorization: Bearer your_secret_here_use_random_string
4. Events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE
```

### 2. Test in Development

**The app works in development without RevenueCat setup:**
- Mobile SDK initialization will succeed with placeholder keys
- Purchases will show mock responses
- Sync calls will reach backend endpoints
- Backend returns mock subscription data

**To test real purchases:**
1. Configure RevenueCat as above
2. Create sandbox test users in App Store Connect (iOS) or Play Console (Android)
3. Use sandbox account when testing purchases
4. Check RevenueCat dashboard for purchase events
5. Verify webhook logs in backend

### 3. Database Setup (TODO - Phase 2)

When ready to persist subscription data, create this schema:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,  -- trial, active, cancelled, expired, past_due
  is_trial BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP,
  will_renew BOOLEAN NOT NULL DEFAULT true,
  store VARCHAR(50),  -- app_store, play_store
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

Then uncomment the database calls in:
- `backend/app/api/subscription/sync/route.ts`
- `backend/app/api/subscription/webhook/route.ts`
- `backend/app/api/subscription/create/route.ts` (GET handler)

## How It Works Now

### Purchase Flow
```
1. User taps "Start Free Trial" in ProfileScreen
2. RevenueCat SDK shows App Store/Play Store payment sheet
3. User confirms (sandbox account in dev, real in prod)
4. RevenueCat validates receipt with Apple/Google
5. Mobile app receives success response
6. Auto-sync: POST /api/subscription/sync
7. Backend logs subscription state (TODO: save to database)
8. UI updates with subscription status
```

### Background Sync (Once Webhook Configured)
```
1. User's subscription renews/cancels/expires
2. RevenueCat sends webhook to backend
3. Backend handles event (logs, TODO: update database, send email)
4. Next time user opens app, status is already up-to-date
```

## Testing Checklist

- [ ] Mobile app compiles (✅ Already verified)
- [ ] Backend compiles (✅ Already verified)
- [ ] Start app, check logs for "RevenueCat initialized successfully"
- [ ] Tap "Start Free Trial" in ProfileScreen (expect mock response in dev)
- [ ] Check terminal logs for "Syncing subscription for user..." in backend
- [ ] Verify sync endpoint returns success
- [ ] (Production) Configure RevenueCat and test sandbox purchase
- [ ] (Production) Verify webhook receives events in RevenueCat dashboard logs

## Next Steps (Priority #5+)

After database migration:
1. ✅ Subscription architecture aligned (Phase 1 complete)
2. ⏳ Email verification frontend (Priority #5)
3. ⏳ Create subscriptions table in database
4. ⏳ Deploy webhook endpoint to production HTTPS URL
5. ⏳ Configure RevenueCat webhook
6. ⏳ Test end-to-end with sandbox purchases
7. ⏳ Add email notifications (trial started, renewal reminder, cancellation)
8. ⏳ Add subscription analytics dashboard

## Support

**See full documentation:** `SUBSCRIPTION_ARCHITECTURE.md`

**Common Issues:**
- "No offerings available" → RevenueCat not configured, using mock mode
- "Sync failed" → Check backend logs, ensure API_URL is correct
- "Webhook not called" → Verify HTTPS URL is publicly accessible

**Resources:**
- RevenueCat Docs: https://docs.revenuecat.com
- Test Purchases: https://docs.revenuecat.com/docs/sandbox
- Webhook Events: https://docs.revenuecat.com/docs/webhooks
