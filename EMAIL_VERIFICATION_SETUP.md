# Email Verification Setup Guide

## Overview

Email verification has been integrated into the registration flow with the following features:
- ✅ Email verification required after registration
- ✅ Dedicated verification instructions screen
- ✅ Resend verification email with cooldown
- ✅ Verification result screen (success/error states)
- ✅ Backend API integration

## User Flow

```
1. User registers → RegisterScreen
   ↓
2. Account created → EmailVerificationScreen
   ↓ (user checks email)
3. User clicks link → EmailVerificationResultScreen
   ↓
4. Success → LoginScreen
```

## Screens Added

### 1. EmailVerificationScreen
**File:** `mobile/screens/EmailVerificationScreen.tsx`

**Features:**
- Shows user's email address
- Step-by-step instructions
- Resend verification email button (60s cooldown)
- Navigation to login
- Help text for common issues

**Props:**
```typescript
interface EmailVerificationScreenProps {
  email: string;
  onNavigateToLogin: () => void;
  onBack: () => void;
}
```

### 2. EmailVerificationResultScreen
**File:** `mobile/screens/EmailVerificationResultScreen.tsx`

**Features:**
- Three states: loading, success, error
- Auto-verifies on mount
- Success state with next steps
- Error state with troubleshooting
- Retry functionality

**Props:**
```typescript
interface EmailVerificationResultScreenProps {
  token: string;
  userId: string;
  onNavigateToLogin: () => void;
  onBack: () => void;
}
```

## Backend API Endpoints

### GET /api/auth/verify-email
**Verify email with token**

Query Parameters:
- `token` (string, required): Verification token from email
- `userId` (string, required): User ID

Response (Success):
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Invalid or expired verification token"
}
```

### POST /api/auth/verify-email
**Resend verification email**

Request Body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

## Navigation Updates

**App.tsx Changes:**
1. Added screen types: `'emailVerification' | 'emailVerificationResult'`
2. Added imports for new screens
3. Added state for verification data:
   ```typescript
   const [verificationEmail, setVerificationEmail] = useState<string>('');
   const [verificationToken, setVerificationToken] = useState<string>('');
   const [verificationUserId, setVerificationUserId] = useState<string>('');
   ```
4. Updated RegisterScreen props to include `onNavigateToEmailVerification`
5. Added screen rendering for verification screens

**RegisterScreen Changes:**
1. Updated props to include `onNavigateToEmailVerification`
2. Changed success handler to navigate to EmailVerificationScreen instead of showing alert
3. Removed auto-navigation to login after registration

## Deep Linking (Optional Enhancement)

**Current State:** Deep linking infrastructure added but not fully activated.

**File Created:** `mobile/utils/deepLinking.ts`

**Features:**
- Parse verification URLs
- Handle initial URL on app open
- Listen for URL events while app is running

**To Enable:**
1. Install expo-linking:
   ```bash
   cd mobile
   npm install expo-linking
   ```

2. Configure app scheme in `app.json`:
   ```json
   {
     "expo": {
       "scheme": "constructionleads",
       "ios": {
         "associatedDomains": ["applinks:yourdomain.com"]
       },
       "android": {
         "intentFilters": [
           {
             "action": "VIEW",
             "data": [
               {
                 "scheme": "constructionleads",
                 "host": "verify"
               }
             ],
             "category": ["BROWSABLE", "DEFAULT"]
           }
         ]
       }
     }
   }
   ```

3. Update email template to use deep link:
   ```
   constructionleads://verify?token=xxx&userId=yyy
   ```

4. Uncomment deep linking code in App.tsx (lines 88-107)

## Email Configuration

Email verification requires SMTP configured in backend. See `backend/lib/email.ts`.

**Current State:** Uses mock email sending (logs to console)

**To Enable Real Emails:**
1. Set environment variables in `.env.local`:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@yourcompany.com
   ```

2. Email template includes verification link that calls GET endpoint

## Testing

### Test Registration Flow

1. **Start app and navigate to register screen**
   ```bash
   cd mobile
   npm start
   ```

2. **Fill out registration form**
   - Toggle "Contractor Account" if testing contractor flow
   - Enter email, password, name

3. **Submit registration**
   - Should navigate to EmailVerificationScreen
   - Email address should be displayed

4. **Check backend logs for verification link**
   - Look for console output with verification URL
   - Example: `http://localhost:3000/api/auth/verify-email?token=abc&userId=123`

5. **Test resend email**
   - Tap "Resend Verification Email"
   - Should show success alert
   - Button disabled for 60 seconds
   - New token generated in backend

### Test Verification

**Option 1: Manual API Call**
```bash
curl "http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN&userId=YOUR_USER_ID"
```

**Option 2: Navigate to Result Screen Programmatically**
- Add test button in LoginScreen
- Set verificationToken and verificationUserId
- Navigate to 'emailVerificationResult'

**Option 3: Use Deep Link (requires expo-linking)**
```
constructionleads://verify?token=YOUR_TOKEN&userId=YOUR_USER_ID
```

## UI/UX Features

### EmailVerificationScreen
- 📧 Large email icon
- Email address highlighted in blue
- Numbered step-by-step instructions
- ⏱️ 24-hour expiration warning
- Resend button with countdown timer
- Help section with troubleshooting tips
- Dark gradient background

### EmailVerificationResultScreen
- **Loading State:** Spinner with "Verifying..." message
- **Success State:**
  - ✓ Large green checkmark
  - Success checklist
  - "Continue to Login" CTA button
  - "What's Next?" guide
  - Green gradient background
- **Error State:**
  - ✗ Large red X icon
  - Error message
  - Common issues list
  - "Try Again" button
  - "Request New Verification Email" button
  - Red gradient background

## Database Integration

**Current State:** Uses in-memory mock storage

**To Enable Database:**
1. Create verification_tokens table:
   ```sql
   CREATE TABLE verification_tokens (
     token VARCHAR(64) PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES users(id),
     email VARCHAR(255) NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
   CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);
   ```

2. Update users table:
   ```sql
   ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT FALSE;
   ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
   ```

3. Replace mock storage in `backend/app/api/auth/verify-email/route.ts`

4. Add cleanup job for expired tokens:
   ```sql
   DELETE FROM verification_tokens WHERE expires_at < NOW();
   ```

## Security Considerations

✅ **Implemented:**
- Tokens expire after 24 hours
- Tokens are single-use (deleted after verification)
- Token length: 32 characters (hexadecimal)
- Email obfuscation (for security, don't reveal if user exists)
- Rate limiting on resend (60-second cooldown)

🔒 **Recommended Enhancements:**
- Add CAPTCHA on resend to prevent abuse
- Log verification attempts for monitoring
- Add IP-based rate limiting  
- Implement account lockout after multiple failed verifications
- Use signed tokens (JWT) instead of random strings
- Add password reset flow using similar verification mechanism

## Troubleshooting

### "Email not sent" error
- Check SMTP configuration in `.env.local`
- Verify email service is running
- Check backend console for errors
- Ensure firewall allows SMTP ports

### "Invalid or expired token" error
- Token expires after 24 hours
- Tokens are single-use (can't verify twice)
- Check URL parameters are complete
- Request new verification email

### Deep link doesn't work
- Ensure expo-linking is installed
- Check app scheme configuration in `app.json`
- Verify URL format: `constructionleads://verify?token=xxx&userId=yyy`
- Test on physical device (deep links may not work in simulator)

### User can't log in after verification
- Check that `verified` flag is set to `true` in database
- Verify login endpoint checks `verified` status
- Ensure backend marks user as verified in verify-email endpoint

## Next Steps

After email verification is working:
1. ⏳ Add password reset flow (similar verification pattern)
2. ⏳ Add email change verification
3. ⏳ Add phone verification (SMS)
4. ⏳ Add social login (Google, Apple)
5. ⏳ Add two-factor authentication
6. ⏳ Add account deletion verification

## Files Modified/Created

**Created:**
- `mobile/screens/EmailVerificationScreen.tsx` (235 lines)
- `mobile/screens/EmailVerificationResultScreen.tsx` (320 lines)
- `mobile/utils/deepLinking.ts` (60 lines)

**Modified:**
- `mobile/screens/RegisterScreen.tsx` - Added onNavigateToEmailVerification prop
- `mobile/App.tsx` - Added email verification screens to navigation
- `backend/app/api/auth/verify-email/route.ts` - Already existed, no changes needed

## TypeScript Status

✅ Mobile: `npx tsc --noEmit` passes  
✅ Backend: `npx tsc --noEmit` passes

## Demo Flow

**Happy Path:**
1. Open app → Login screen
2. Tap "Create Account"
3. Fill form → Submit
4. **EmailVerificationScreen appears**
   - Shows email address
   - Shows instructions
5. Check backend console for verification link
6. Copy token and userId from log
7. Navigate to result screen (or call API)
8. **EmailVerificationResultScreen shows success**
   - Green checkmark
   - "Continue to Login" button
9. Tap button → Login screen
10. Log in with credentials → Success!

**Error Path:**
1. Follow steps 1-6 above
2. Wait 25 hours (or use expired token)
3. Try to verify
4. **EmailVerificationResultScreen shows error**
   - Red X icon
   - Error message
   - "Try Again" and "Request New Email" buttons
5. Tap "Request New Email"
6. Back to EmailVerificationScreen
7. Tap "Resend"
8. New token generated → Repeat verification

## Support

For issues or questions:
- Check backend logs: `backend/` terminal
- Check mobile logs: Metro bundler output
- Review email configuration: `backend/lib/email.ts`
- Review API responses: Network tab in React Native Debugger
