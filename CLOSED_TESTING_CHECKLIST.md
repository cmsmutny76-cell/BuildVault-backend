# 🧪 Closed Testing Checklist
## Construction Lead App - Beta Release Requirements

**Last Updated:** March 15, 2026  
**Target:** Get into TestFlight (iOS) and Google Play Closed Testing  
**Timeline:** 3-5 days  

---

## Overview

This checklist covers **only** what's needed to get the app into closed testing. Everything else can be implemented while beta testers provide feedback.

**For Closed Testing, We Can:**
- ✅ Use mock data (database not required)
- ✅ Log emails to console (no real email service needed)
- ✅ Use mock file uploads (S3 not required)
- ✅ Skip full security hardening (add before production)
- ✅ Use basic error handling (advanced monitoring not needed)

**What We MUST Have:**
- ✅ App builds without errors
- ✅ App doesn't crash on launch
- ✅ Core user flows work (registration, login, basic features)
- ✅ Developer accounts set up
- ✅ Build configuration ready

---

## 🔴 Critical for Closed Testing (3-5 Days)

### 1. ✅ App Compilation (COMPLETE)

**Status:** ✅ Done  
**Evidence:** TypeScript compilation passing on both backend and mobile

```bash
# Already verified working:
cd backend && npx tsc --noEmit  # ✅ Passing
cd mobile && npx tsc --noEmit   # ✅ Passing
```

---

### 2. Developer Account Setup

**Status:** ❌ Not Started  
**Time Required:** 1-2 hours (+ approval wait time)  
**Cost:** $124 total

#### iOS - Apple Developer Program
- [ ] Sign up at [developer.apple.com](https://developer.apple.com)
- [ ] Cost: $99/year
- [ ] Approval time: Usually instant, can take 24-48 hours
- [ ] What you get: TestFlight access, App Store publishing
- [ ] Action items:
  - [ ] Create Apple ID (or use existing)
  - [ ] Enroll in Apple Developer Program
  - [ ] Accept agreements
  - [ ] Set up App Store Connect account

#### Android - Google Play Console
- [ ] Sign up at [play.google.com/console](https://play.google.com/console)
- [ ] Cost: $25 one-time fee
- [ ] Approval time: Usually 24-48 hours
- [ ] What you get: Internal testing, closed testing, production publishing
- [ ] Action items:
  - [ ] Create Google Play Developer account
  - [ ] Pay $25 registration fee
  - [ ] Accept Developer Agreement
  - [ ] Complete account details

**Total Cost:** $99 + $25 = **$124**

**Notes:**
- Both accounts can be personal or business
- Use a stable email address (you'll get important notifications)
- Keep login credentials secure
- Approval can take 1-2 business days, start this ASAP

---

### 3. Expo EAS Build Setup

**Status:** ❌ Not Started  
**Time Required:** 2-3 hours  
**Cost:** Free tier available, $29/month for faster builds

**Tasks:**

#### Install EAS CLI
```bash
npm install -g eas-cli
eas login  # or create account at expo.dev
```

#### Configure EAS in Project
```bash
cd mobile
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.constructionleadapp.app"
      },
      "android": {
        "package": "com.constructionleadapp.app"
      }
    }
  }
}
```

#### Update app.json
```bash
# File: mobile/app.json
```
Add:
```json
{
  "expo": {
    "name": "Construction Lead App",
    "slug": "construction-lead-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.constructionleadapp.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.constructionleadapp.app",
      "versionCode": 1
    }
  }
}
```

#### Setup Apple Credentials
```bash
eas credentials  # Follow prompts to generate certificates
```

EAS will automatically:
- Generate iOS distribution certificate
- Generate iOS provisioning profile
- Store credentials securely

#### Setup Android Keystore
```bash
eas credentials  # Android keystore will be generated
```

**Checklist:**
- [ ] Install EAS CLI globally
- [ ] Create/login to Expo account
- [ ] Run `eas build:configure`
- [ ] Update app.json with bundle identifiers
- [ ] Generate iOS credentials
- [ ] Generate Android keystore
- [ ] Verify credentials stored in EAS

---

### 4. App Icon & Splash Screen

**Status:** ❌ Not Started  
**Time Required:** 1-2 hours  
**Can Use:** Placeholder for now, improve later

**Requirements:**

#### App Icon
- **Size:** 1024x1024 pixels
- **Format:** PNG with no transparency
- **Design:** Simple, recognizable logo
- **Quick Option:** Use a generator tool or create basic placeholder

```bash
# File: mobile/assets/icon.png
# Required: 1024x1024 PNG
```

#### Splash Screen
- **Size:** 1284x2778 pixels (iPhone 13 Pro Max)
- **Format:** PNG
- **Design:** App icon + name on solid background

```bash
# File: mobile/assets/splash.png
# Required: 1284x2778 PNG
```

**Quick Solutions:**
1. Use Canva (free) to create simple designs
2. Use [appicon.co](https://appicon.co) to generate from single image
3. For beta: Even a solid color + text is fine
4. Improve designs during beta testing phase

**Update app.json:**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    }
  }
}
```

**Checklist:**
- [ ] Create or generate app icon (1024x1024)
- [ ] Create or generate splash screen
- [ ] Add files to mobile/assets/
- [ ] Update app.json with paths
- [ ] Test icon appears correctly

---

### 5. Minimal Environment Setup

**Status:** 🔧 Partial  
**Time Required:** 30 minutes  
**What's Needed:** Just enough to make app functional for testing

**Current Status:**
- ✅ RevenueCat keys (partially configured)
- ❌ Missing: Backend API URL

**For Closed Testing, We ONLY Need:**

#### Backend .env (Create if doesn't exist)
```bash
# File: backend/.env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional for testing (features work with mocks if missing):
# OPENAI_API_KEY=sk-... (AI features will use mock data)
# DATABASE_URL=... (using in-memory Maps)
# AWS_S3_BUCKET=... (using mock URLs)
# STRIPE_SECRET_KEY=... (using mock payments)
```

#### Mobile .env (if needed)
```bash
# File: mobile/.env (create if doesn't exist)
EXPO_PUBLIC_API_URL=http://localhost:3000

# RevenueCat (already configured)
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=test_gEXCOKhBXscVhavZesQcP1LAfH
```

**For Beta Testing:**
- ✅ Email verification: Console logs are fine for beta
- ✅ Photo uploads: Mock URLs work for testing
- ✅ Database: In-memory Maps are fine (data resets on restart)
- ✅ Payments: RevenueCat sandbox mode works
- ✅ AI features: Mock data works for testing flow

**Checklist:**
- [ ] Create backend/.env (even if mostly empty)
- [ ] Set NEXT_PUBLIC_API_URL (localhost for now)
- [ ] Verify RevenueCat keys are set
- [ ] Test app runs locally

**Note:** We can deploy backend to a hosted service (Vercel, Railway) later for remote testing. For initial closed testing, localhost or simple deploy is fine.

---

### 6. Build the App

**Status:** ❌ Not Started  
**Time Required:** 1-2 hours (+ build time on EAS servers)  

**iOS Build for TestFlight:**
```bash
cd mobile
eas build --platform ios --profile preview
```

This will:
1. Upload code to EAS servers
2. Build iOS .ipa file
3. Take ~20-30 minutes
4. Provide download link when complete

**Android Build for Internal Testing:**
```bash
cd mobile
eas build --platform android --profile preview
```

This will:
1. Upload code to EAS servers
2. Build Android .aab file
3. Take ~15-20 minutes
4. Provide download link when complete

**Checklist:**
- [ ] Run iOS build command
- [ ] Wait for build to complete (~20-30 min)
- [ ] Download .ipa file
- [ ] Run Android build command
- [ ] Wait for build to complete (~15-20 min)
- [ ] Download .aab file
- [ ] Verify both builds downloaded successfully

**Troubleshooting:**
- If build fails, check error logs in EAS dashboard
- Common issues: Missing credentials, app.json errors, native code issues
- EAS provides detailed error messages

---

### 7. TestFlight Setup (iOS)

**Status:** ❌ Not Started  
**Time Required:** 1 hour  
**Prerequisites:** Apple Developer account approved

**Tasks:**

#### Create App in App Store Connect
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in details:
   - Platform: iOS
   - Name: "Construction Lead App"
   - Primary Language: English
   - Bundle ID: com.constructionleadapp.app (must match app.json)
   - SKU: constructionleadapp (unique identifier)

#### Upload Build to TestFlight
```bash
# Option 1: EAS Submit (easiest)
cd mobile
eas submit --platform ios

# Option 2: Manual upload via Transporter app
# Download .ipa from EAS
# Open Transporter app
# Drag and drop .ipa file
```

#### Set Up TestFlight
1. In App Store Connect, go to TestFlight tab
2. Wait for build to process (5-15 minutes)
3. Fill in "What to Test" notes
4. Add beta testers:
   - Internal Testing: Up to 100 Apple Developer team members
   - External Testing: Up to 10,000 testers (requires Beta App Review)

#### Export Compliance
- For beta: Select "No" for encryption (unless using HTTPS beyond standard)
- This is a yes/no question in TestFlight

**Checklist:**
- [ ] Create app in App Store Connect
- [ ] Upload build via EAS Submit
- [ ] Wait for build processing
- [ ] Add test information
- [ ] Invite internal testers (yourself, team)
- [ ] Install TestFlight app on iPhone
- [ ] Test installation works

**Beta Tester Limit:**
- Internal: 100 testers (instant, no review)
- External: 10,000 testers (requires Apple beta review, ~24 hours)

---

### 8. Google Play Closed Testing Setup (Android)

**Status:** ❌ Not Started  
**Time Required:** 1 hour  
**Prerequisites:** Google Play Developer account approved

**Tasks:**

#### Create App in Play Console
1. Go to [play.google.com/console](https://play.google.com/console)
2. Click "Create app"
3. Fill in details:
   - App name: "Construction Lead App"
   - Default language: English
   - App or game: App
   - Free or paid: Free
4. Complete app declarations (privacy policy, etc.)

#### Upload Build
```bash
# Option 1: EAS Submit (easiest)
cd mobile
eas submit --platform android

# Option 2: Manual upload
# Download .aab from EAS
# Go to Play Console → Release → Testing → Internal testing
# Upload .aab file
```

#### Set Up Closed Testing Track
1. In Play Console, go to Testing → Closed testing
2. Create new release
3. Upload .aab file
4. Add release notes (what's being tested)
5. Save and review
6. Create tester list:
   - Add testers by email
   - Or create email list file
7. Start rollout

#### Content Rating
- Fill out content rating questionnaire
- For beta: Can use basic ratings
- Refine before production

**Checklist:**
- [ ] Create app in Play Console
- [ ] Upload .aab via EAS Submit
- [ ] Set up closed testing track
- [ ] Add release notes
- [ ] Create tester email list
- [ ] Add your email as tester
- [ ] Start rollout
- [ ] Install from Play Store link
- [ ] Test installation works

**Beta Tester Limits:**
- Internal testing: Up to 100 testers (instant)
- Closed testing: Up to 14 tracks, unlimited testers
- Open testing: Unlimited (appears in Play Store)

---

### 9. Basic Manual Testing

**Status:** ❌ Not Started  
**Time Required:** 2-3 hours  

**Critical Flows to Test:**

#### Registration & Login Flow
- [ ] Open app for first time
- [ ] Navigate to registration
- [ ] Fill out registration form
- [ ] Submit registration
- [ ] Verify success (even if email not sent, check console)
- [ ] Logout
- [ ] Login with credentials
- [ ] Verify login success

#### Homeowner Core Flow
- [ ] Login as homeowner
- [ ] View dashboard
- [ ] Navigate to project categories
- [ ] Create a new project (basic details)
- [ ] View project details
- [ ] Test messaging (send message)
- [ ] View contractors

#### Contractor Core Flow
- [ ] Register as contractor
- [ ] Complete profile
- [ ] View leads/projects
- [ ] Send message to homeowner
- [ ] View messaging list

#### Basic Navigation
- [ ] Test all bottom tab navigation
- [ ] Test screen transitions
- [ ] Test back buttons
- [ ] Test logout
- [ ] Verify no crashes

**Test Devices:**
- [ ] iPhone (any model available)
- [ ] Android phone (any model available)

**Known Issues to Document:**
- List any bugs found
- Note if they're blockers or can wait
- Track in BUILDVAULT_TODO.md or separate file

---

## 📋 Pre-Submission Checklist

Before submitting to TestFlight/Play Console:

### App Quality
- [ ] App builds without errors
- [ ] App launches without crashing
- [ ] Can create account
- [ ] Can login
- [ ] Main features accessible
- [ ] No obviously broken UI

### App Store Requirements
- [ ] App icon (1024x1024)
- [ ] Splash screen
- [ ] App name set
- [ ] Bundle ID/Package name set
- [ ] Version number (1.0.0)
- [ ] Build number (1 for iOS, versionCode 1 for Android)

### Developer Accounts
- [ ] Apple Developer account active
- [ ] Google Play Developer account active
- [ ] Payment methods on file (if applicable)

### Build Configuration
- [ ] EAS configured
- [ ] Credentials generated
- [ ] app.json properly configured
- [ ] Builds successfully on EAS

---

## 🚀 Deployment Timeline

### Day 1: Setup (4-6 hours)
**Morning:**
- [ ] Sign up for Apple Developer ($99)
- [ ] Sign up for Google Play Developer ($25)
- [ ] Install EAS CLI
- [ ] Configure EAS in project

**Afternoon:**
- [ ] Create app icon & splash screen (can be basic)
- [ ] Update app.json configuration
- [ ] Generate iOS credentials
- [ ] Generate Android keystore

### Day 2: Building (3-4 hours + wait time)
**Morning:**
- [ ] Create backend/.env
- [ ] Test app runs locally
- [ ] Fix any critical bugs

**Afternoon:**
- [ ] Start iOS build on EAS (~30 min)
- [ ] Start Android build on EAS (~20 min)
- [ ] Wait for builds to complete
- [ ] Download build files

### Day 3: App Store Setup (3-4 hours)
**Morning:**
- [ ] Create app in App Store Connect
- [ ] Submit iOS build to TestFlight
- [ ] Wait for processing

**Afternoon:**
- [ ] Create app in Google Play Console
- [ ] Submit Android build to closed testing
- [ ] Set up tester lists

### Day 4: Testing (2-3 hours)
- [ ] Install on iOS device via TestFlight
- [ ] Install on Android device via Play Store
- [ ] Run through test scenarios
- [ ] Document bugs
- [ ] Fix critical issues if any

### Day 5: Beta Launch
- [ ] Invite beta testers
- [ ] Send instructions to testers
- [ ] Monitor for crash reports
- [ ] Collect feedback

**Total Time:** 3-5 days (depending on approval times)

---

## 💰 Costs for Closed Testing

| Item | Cost | Frequency | Required? |
|------|------|-----------|-----------|
| Apple Developer | $99 | Annual | Yes (iOS) |
| Google Play Developer | $25 | One-time | Yes (Android) |
| EAS Build (Free Tier) | $0 | - | Yes |
| EAS Build (Priority) | $29 | Monthly | Optional |
| **Total Initial Cost** | **$124** | - | - |

**Notes:**
- EAS free tier includes slower builds (sufficient for beta)
- Can upgrade to EAS paid if need faster builds
- No other costs required for closed testing
- Backend can run locally (no hosting cost for beta)

---

## 🎯 What We're NOT Doing (Yet)

These can wait until after closed testing:

❌ **Database migration** - Mock data works for beta  
❌ **Email service** - Console logs for beta are fine  
❌ **S3 file storage** - Mock URLs work for testing  
❌ **Payment processing** - Can test with Stripe sandbox  
❌ **Security hardening** - Basic security is enough for closed testing  
❌ **Real-time messaging** - Polling works for beta  
❌ **Push notifications** - Nice to have, not critical  
❌ **Analytics** - Can add during beta  
❌ **Comprehensive testing** - Manual testing for beta is fine  
❌ **Production deployment** - Local/simple deploy for beta  
❌ **Legal compliance** - Can add Terms/Privacy during beta  
❌ **App Store screenshots** - Not needed for closed testing  
❌ **Marketing materials** - Internal testers only  

**Why This Works:**
- Closed testing = internal testers who know it's beta
- Focus on getting **feedback on UX/features**
- Iterate quickly based on beta tester input
- Build production infrastructure in parallel
- 2-3 week testing period gives time for backend work

---

## 📱 Beta Tester Instructions

Once in closed testing, send this to testers:

### For iOS (TestFlight):
1. Install TestFlight app from App Store
2. Open invitation email/link
3. Tap "View in TestFlight"
4. Install "Construction Lead App"
5. Open app and start testing

### For Android (Google Play):
1. Open invitation email/link
2. Tap "Become a tester"
3. Go to Play Store
4. Search "Construction Lead App"
5. Install and open

### What to Test:
- Try to break it! We want to find bugs now.
- Test registration, login, creating projects
- Test messaging features
- Test all major screens
- Note anything confusing or broken
- Share feedback via [feedback form/email]

### Known Issues:
- Email verification links won't work (expected)
- Some images may not upload (expected)
- Data may reset when app updates (expected)
- Some features are placeholders

---

## ✅ Success Criteria

**Closed Testing is Successful When:**

1. ✅ App installs via TestFlight (iOS)
2. ✅ App installs via Play Store (Android)
3. ✅ Users can register/login
4. ✅ Main features are accessible
5. ✅ No critical crashes
6. ✅ Feedback collected from 5-10 testers
7. ✅ Major bugs documented

**Then We Can:**
- Fix bugs while app is in beta
- Build production infrastructure
- Implement database migration
- Set up email service
- Add security hardening
- Prepare for public launch

---

## 🆘 Troubleshooting

### "Build failed on EAS"
- Check error logs in EAS dashboard
- Common fix: Update dependencies, fix app.json
- Ask in Expo Discord for help

### "Apple Developer account pending"
- Can take 24-48 hours
- Check email for verification
- Contact Apple support if >48 hours

### "Can't upload to TestFlight"
- Verify bundle ID matches App Store Connect
- Check certificates are valid
- Try `eas submit` command

### "Android build won't install"
- Make sure using .aab not .apk for Play Store
- Check package name matches Play Console
- Verify signing configuration

### "App crashes on launch"
- Check EAS build logs for errors
- Test locally first: `npx expo start`
- Look for missing environment variables

---

## 📝 Next Steps After Beta

Once in closed testing:

**Week 1-2: Bug Fixes**
- Fix critical bugs from beta feedback
- Improve UX based on tester input
- Add missing features if needed

**Week 2-4: Infrastructure**
- Set up production database
- Configure email service
- Implement S3 storage
- Security hardening
- Deploy backend to production

**Week 4-6: Polish**
- Add push notifications
- Real-time messaging
- Analytics integration
- App Store assets (screenshots, videos)
- Legal compliance (Terms, Privacy)

**Week 6+: Public Launch**
- Submit for App Store review
- Launch marketing campaigns
- Start growth initiatives

---

**Ready to start?** Let's begin with developer account setup and EAS configuration!
