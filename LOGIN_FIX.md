# Login Issue - Fixed! ✅

## The Problem
Users couldn't log in because the demo account credentials shown on the login screen were incorrect.

## What Was Wrong
- **Frontend showed**: `user@example.com` / `contractor@example.com` with password "any password"
- **Backend expected**: `homeowner@test.com` / `contractor@test.com` with password "password123"

## The Fix
Updated the login screen to show the correct demo credentials that match the backend mock users.

## How to Use

### Demo Accounts (For Testing)
Use these credentials to test the app:

**Homeowner Account:**
- Email: `homeowner@test.com`
- Password: `password123`

**Contractor Account:**
- Email: `contractor@test.com`
- Password: `password123`

### New User Registration
When you register a new account:
1. Fill out the registration form
2. Click "Create Account"
3. **Check your email** for a verification link (if SMTP is configured)
4. Click the verification link in the email
5. Return to the app and log in with your credentials

⚠️ **Important**: New users must verify their email before they can log in. The backend will return an error "Please verify your email before logging in" if you try to login without verifying.

## SMTP Configuration
For email verification to work, you need to configure SMTP settings in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

See [EMAIL_PDF_SETUP.md](EMAIL_PDF_SETUP.md) for detailed setup instructions.

## Development Mode
If you don't have SMTP configured yet, you can:
1. Use the demo accounts (already verified)
2. Or temporarily disable email verification in the backend

## Summary
✅ Login screen now shows correct demo credentials  
✅ Registration flow updated to explain email verification  
✅ Demo accounts work immediately (already verified)  
✅ New accounts require email verification before login
