# Construction Lead App - Email & PDF Features

## Setup Instructions

### 1. Email Configuration (SMTP)

The app uses SMTP for sending emails. Follow these steps to configure:

#### For Gmail (Recommended for Development):

1. **Enable 2-Factor Authentication:**
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Follow the steps to enable 2FA

2. **Generate App Password:**
   - In Google Account settings, go to Security
   - Under "2-Step Verification", scroll to "App passwords"
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Configure Environment Variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your-secure-jwt-secret
   ```

#### For Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**SendGrid (Production recommended):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

### 2. Test Email Connection

```bash
cd backend
npm run dev
```

The email service will automatically verify the SMTP connection on startup.

### 3. Email Features Implemented

✅ **Email Verification**
- New users receive a verification email upon registration
- 24-hour token expiry
- Beautiful HTML email with gradient design

✅ **Password Reset**
- Users can request password reset via email
- 1-hour token expiry
- Security warnings included

✅ **Estimate Notifications**
- Homeowners receive email when contractor sends estimate
- Includes estimate total and contractor information
- Direct link to view estimate

✅ **Estimate Acceptance**
- Contractors receive email when estimate is accepted
- Congratulatory message with next steps
- Project details included

✅ **Message Notifications**
- Users receive email for new messages
- Message preview included
- Direct link to conversation

### 4. PDF Generation Features

✅ **Professional PDF Estimates**
- Generated dynamically from estimate data
- Includes:
  - Company branding and logo
  - Contractor and homeowner information
  - Itemized line items grouped by category
  - Subtotal, tax, and total calculations
  - Notes and terms
  - Professional footer

✅ **PDF Delivery Methods**

**Download PDF:**
```
GET /api/quotes/pdf?estimateId=xxx
```
Returns PDF file for download

**Email PDF:**
```
POST /api/quotes/pdf
{
  "estimateId": "est_123",
  "recipientEmail": "homeowner@example.com",
  "sendCopy": true  // Optional: CC contractor
}
```
Emails PDF as attachment with cover email

### 5. Testing

#### Test Email Sending:
```bash
# Register a new user (sends verification email)
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "userType": "homeowner"
  }'
```

#### Test PDF Generation:
```bash
# Download PDF estimate
curl http://localhost:3000/api/quotes/pdf?estimateId=est_123 \
  --output estimate.pdf

# Email PDF estimate
curl -X POST http://localhost:3000/api/quotes/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "estimateId": "est_123",
    "recipientEmail": "homeowner@example.com",
    "sendCopy": true
  }'
```

### 6. API Endpoints

**Authentication & Verification:**
- `POST /api/users/register` - Register with email verification
- `POST /api/auth/reset-password` - Request password reset
- `GET /api/auth/verify-email?token=xxx&userId=yyy` - Verify email
- `POST /api/auth/verify-email` - Resend verification email

**Estimates:**
- `GET /api/quotes/pdf?estimateId=xxx` - Download PDF estimate
- `POST /api/quotes/pdf` - Email PDF estimate
- `POST /api/quotes/accept` - Accept estimate (sends contractor email)

**Messages:**
- `POST /api/messages` - Send message (sends recipient email)

### 7. Email Templates

All emails include:
- Professional HTML design with gradients
- Mobile-responsive layout
- Plain text alternative
- Clear call-to-action buttons
- Footer with app information

Template previews:
1. **Verification Email** - Purple gradient header, verification button
2. **Password Reset** - Security warnings, reset button, 1-hour expiry
3. **Estimate Notification** - Shows total, contractor info, view button
4. **Estimate Accepted** - Green success theme, next steps
5. **New Message** - Message preview, conversation link

### 8. Production Considerations

⚠️ **Before deploying to production:**

1. **Use Professional Email Service:**
   - Switch from Gmail to SendGrid/Mailgun/AWS SES
   - Higher sending limits
   - Better deliverability
   - Detailed analytics

2. **Database Integration:**
   - Currently using in-memory storage (Map)
   - Replace with PostgreSQL/MongoDB for production
   - Store verification tokens in database

3. **Email Queue:**
   - Implement job queue (Bull, BullMQ)
   - Send emails asynchronously
   - Retry failed sends
   - Monitor delivery status

4. **Rate Limiting:**
   - Limit verification email resends
   - Prevent spam/abuse
   - Implement cooldown periods

5. **Security:**
   - Rotate JWT secrets regularly
   - Use strong SMTP passwords
   - Enable HTTPS in production
   - Validate all email addresses

6. **Monitoring:**
   - Track email delivery rates
   - Monitor bounce rates
   - Log failed sends
   - Set up alerts

### 9. Troubleshooting

**Emails not sending:**
- Check SMTP credentials in .env
- Verify SMTP server is accessible
- Check console for error messages
- Test with `verifyEmailConnection()`

**Gmail app password not working:**
- Ensure 2FA is enabled
- Generate new app password
- Copy password without spaces
- Use 16-character password (not account password)

**PDF generation errors:**
- Check estimate data format
- Verify all required fields present
- Check console for stack traces

**Email goes to spam:**
- Use professional email service in production
- Set up SPF/DKIM/DMARC records
- Avoid spam trigger words
- Include unsubscribe link (for production)

### 10. Next Steps

**Recommended improvements:**
- [ ] Add email templates for more events
- [ ] Implement email preferences (opt-in/opt-out)
- [ ] Add email analytics
- [ ] Create email preview mode for testing
- [ ] Add attachment support for messages
- [ ] Implement read receipts
- [ ] Add websockets for real-time messaging
- [ ] Create admin panel for email management

## Support

For issues or questions, please check:
- Console logs for detailed errors
- SMTP server status
- Environment variable configuration
- Network connectivity

Happy building! 🏗️
