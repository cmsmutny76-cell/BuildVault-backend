# 📋 Quick Reference: Google Play Console Setup

## Copy-Paste for Google Play Console

---

### 🔐 TEST CREDENTIALS (Paste in "Release Notes" or separate doc)

```
Test Account #1 - Homeowner:
Email: homeowner@test.com
Password: password123

Test Account #2 - Contractor:
Email: contractor@test.com
Password: password123

Users can also register with their own email address.
```

---

### 📝 ADDITIONAL INSTRUCTIONS FOR TESTERS

**Paste this in Google Play Console → Testing → Internal testing → Additional instructions:**

```
BUILDVAULT BETA TEST CREDENTIALS

Test Accounts:
• Homeowner: homeowner@test.com | Password: password123
• Contractor: contractor@test.com | Password: password123

Or create your own account by tapping "Register" on the welcome screen.

WHAT TO TEST:
✓ Create projects and upload photos
✓ AI photo analysis (key feature - may show mock results) 
✓ Browse and match with contractors
✓ Request estimates and compare quotes
✓ Send messages and share documents
✓ View project dashboard and timeline

KNOWN BETA LIMITATIONS:
• AI analysis shows sample data (OpenAI integration pending)
• Some features use mock/demo data
• Email verification may not send (accounts auto-approved)
• Payments in test mode (no real charges)

FEEDBACK:
Report issues via Settings → Help & Support or email beta@buildvault.app

Thank you for testing BuildVault! 🏗️
```

---

### 📧 EMAIL TO SEND TESTERS

**Subject:** Welcome to BuildVault Beta Testing! 🏗️

```
Hi [Tester Name],

Welcome to the BuildVault beta testing program!

You've been added to our internal testing track on Google Play. Here's how to get started:

1. CHECK YOUR EMAIL for the Google Play invitation and accept it
2. DOWNLOAD BuildVault from the Play Store internal testing link
3. LOGIN with test credentials:
   • Homeowner: homeowner@test.com / password123
   • Contractor: contractor@test.com / password123
   • Or register with your own email

4. TEST these core features:
   ✓ Project creation with photos
   ✓ AI photo analysis  
   ✓ Contractor matching
   ✓ Request estimates
   ✓ In-app messaging

5. REPORT ISSUES:
   • In-app: Settings → Help & Support
   • Email: beta@buildvault.app

BETA NOTES:
• Some features show mock/demo data  
• AI analysis in test mode
• No real payments charged

We've attached a complete testing guide with more details.

Thanks for helping make BuildVault better!

The BuildVault Team
beta@buildvault.app

---
Attachment: BETA_TESTING_GUIDE.md
```

---

### ⚙️ SETUP CHECKLIST FOR GOOGLE PLAY CONSOLE

Before you can add testers, complete these sections:

- [ ] **Main store listing** - App name, descriptions, graphics
- [ ] **Content rating** - Complete questionnaire  
- [ ] **Target audience** - Age groups and content
- [ ] **Privacy policy** - URL to your privacy policy
- [ ] **Data safety** - What data you collect
- [ ] **App access** - Special access instructions (if any)
- [ ] **Ads** - Does your app have ads? (No for BuildVault)

Then:
- [ ] **Create internal testing track**
- [ ] **Upload AAB file**
- [ ] **Add test credentials** in release notes
- [ ] **Add tester email addresses**
- [ ] **Start rollout to internal testing**

---

### 👥 ADDING TESTERS

**Google Play Console → Testing → Internal testing → Testers:**

1. Create email list:
   - Add individual emails
   - Or create Google Group and add that

2. Click **"Save"**

3. Copy the **opt-in URL** and send to testers

**Opt-in URL looks like:**
```
https://play.google.com/apps/internaltest/[LONG_CODE]
```

Send this URL to testers so they can join.

---

### 🚀 FIRST RELEASE NOTES

**Paste in "Release notes" field:**

```
BuildVault Beta v1.0.0 - Internal Testing

Welcome to BuildVault beta testing!

NEW IN THIS BUILD:
• Complete authentication system
• Project creation with photo upload
• AI-powered contractor matching
• Estimate request and comparison
• In-app messaging and chat
• Project dashboard and timeline
• Contractor profiles and portfolios

BETA LIMITATIONS:
• AI analysis shows sample data
• Some mock/demo content present
• Email verification disabled for testing
• Payments in test mode

TEST CREDENTIALS:
homeowner@test.com / password123
contractor@test.com / password123

Or register with your own email.

REPORT ISSUES: beta@buildvault.app

Thank you for testing! 🏗️
```

---

### 🎯 QUICK COMMANDS TO SETUP TEST ACCOUNTS

**Generate password hashes:**
```bash
cd backend
node scripts/seed-test-accounts.js hash
```

**Seed accounts via API (backend must be running):**
```bash
cd backend
npm run dev  # In separate terminal
node scripts/seed-test-accounts.js seed
```

**Or manually via registration endpoint:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "homeowner@test.com",
   "password": "password123",
    "userType": "homeowner",
    "name": "Test Homeowner"
  }'
```

---

### 📊 WHAT HAPPENS NEXT

**Timeline:**
1. **Day 1:** Add testers, they receive invitation
2. **Day 1-2:** Testers install and begin testing
3. **Week 1-2:** Collect feedback and fix critical bugs
4. **Week 3-4:** Roll out updates to internal testing
5. **Week 5-6:** Expand to closed testing (more testers)
6. **Week 7-8:** Open testing or production launch

**Tester Feedback Cycle:**
- Monitor crash reports in Play Console
- Check pre-launch reports
- Read user feedback
- Update app with fixes
- Upload new AAB build
- Roll out to testers
- Repeat

---

### 🆘 COMMON ISSUES

**Problem:** Testers can't find the app
→ They need to accept the invitation email first

**Problem:** Login fails with test credentials  
→ Ensure backend has seeded the test accounts

**Problem:** App crashes on startup
→ Check Play Console pre-launch report for device compatibility

**Problem:** Features show "coming soon" or errors
→ Expected in beta - note in release notes which features are placeholders

---

**Files Created:**
- ✅ BETA_TESTING_GUIDE.md - Complete guide for testers (9,500 words)
- âœ… BUILDVAULT_PLAY_STORE_TEST_INSTRUCTIONS.md - Google Play Console copy-paste text
- âœ… backend/scripts/seed-test-accounts.js - Script to create test accounts
- âœ… backend/app/test-accounts.ts - Test account configuration
- âœ… BUILDVAULT_PLAY_STORE_QUICK_REFERENCE.md - This file

**Next Steps:**
1. Copy test credentials to Google Play Console
2. Add tester emails
3. Send welcome email to testers
4. Monitor feedback and crashes
5. Iterate based on feedback
