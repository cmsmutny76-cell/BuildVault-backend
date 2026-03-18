import nodemailer from 'nodemailer';

export function isEmailEnabled(): boolean {
  const value = (process.env.EMAIL_ENABLED || '').toLowerCase();
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  // Safe default: keep email transport off in development unless explicitly enabled.
  return process.env.NODE_ENV !== 'development';
}

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
};

// Create reusable transporter
export const transporter = nodemailer.createTransport(EMAIL_CONFIG);

async function guardedSendMail(mailOptions: nodemailer.SendMailOptions, context: string) {
  if (!isEmailEnabled()) {
    console.log(`[email] Skipped ${context} because EMAIL_ENABLED is not true.`);
    return {
      messageId: 'email-disabled',
    } as nodemailer.SentMessageInfo;
  }

  return transporter.sendMail(mailOptions);
}

// Verify connection configuration
export async function verifyEmailConnection() {
  if (!isEmailEnabled()) {
    console.log('[email] Transport disabled in current environment.');
    return true;
  }

  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  userId: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&userId=${userId}`;

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: email,
    subject: 'Verify Your Email - LeadGen Pro',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🏗️ LeadGen Pro</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Verify Your Email Address</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for signing up with LeadGen Pro! To complete your registration and start connecting with construction professionals, please verify your email address.
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        Click the button below to verify your email:
                      </p>
                      
                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                        If the button doesn't work, copy and paste this link into your browser:
                        <br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                      </p>
                      
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        This link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This email was sent to ${email}. If you didn't create an account with LeadGen Pro, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      Verify Your Email - LeadGen Pro
      
      Thank you for signing up with LeadGen Pro!
      
      To complete your registration, please verify your email address by clicking the link below:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with LeadGen Pro, you can safely ignore this email.
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'verification email');
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: email,
    subject: 'Reset Your Password - LeadGen Pro',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🏗️ LeadGen Pro</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        If the button doesn't work, copy and paste this link:
                        <br>
                        <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                      </p>
                      
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        This link will expire in 1 hour.
                      </p>
                      
                      <p style="color: #ff6b6b; font-size: 14px; line-height: 1.6; margin: 20px 0 0; padding: 15px; background-color: #fff5f5; border-left: 4px solid #ff6b6b; border-radius: 4px;">
                        <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This email was sent to ${email}.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      Reset Your Password - LeadGen Pro
      
      We received a request to reset your password.
      
      Click the link below to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and ensure your account is secure.
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'password reset email');
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

// Send new estimate notification to homeowner
export async function sendEstimateNotificationEmail(
  homeownerEmail: string,
  homeownerName: string,
  contractorName: string,
  projectTitle: string,
  estimateTotal: number,
  estimateId: string
) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/estimates/${estimateId}`;

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: homeownerEmail,
    subject: `New Estimate Received for ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Estimate Received</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🏗️ LeadGen Pro</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">New Estimate Received! 📋</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${homeownerName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Great news! <strong>${contractorName}</strong> has submitted an estimate for your project: <strong>${projectTitle}</strong>
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <tr>
                          <td>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Contractor:</strong> ${contractorName}</p>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Project:</strong> ${projectTitle}</p>
                            <p style="color: #333333; font-size: 24px; margin: 10px 0 0; font-weight: bold;">
                              Total: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              View Estimate Details
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        Review the estimate and contact the contractor if you have any questions. You can accept or request changes through the app.
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This notification was sent to ${homeownerEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      New Estimate Received - LeadGen Pro
      
      Hi ${homeownerName},
      
      ${contractorName} has submitted an estimate for "${projectTitle}":
      
      Total: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      
      View estimate: ${viewUrl}
      
      Review the estimate and contact the contractor if you have any questions.
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'estimate notification email');
    console.log('Estimate notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send estimate notification:', error);
    return { success: false, error };
  }
}

// Send estimate accepted notification to contractor
export async function sendEstimateAcceptedEmail(
  contractorEmail: string,
  contractorName: string,
  homeownerName: string,
  projectTitle: string,
  estimateTotal: number
) {
  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: contractorEmail,
    subject: `Estimate Accepted: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate Accepted</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Your Estimate Was Accepted!</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${contractorName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Great news! <strong>${homeownerName}</strong> has accepted your estimate for "${projectTitle}".
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <tr>
                          <td>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Homeowner:</strong> ${homeownerName}</p>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Project:</strong> ${projectTitle}</p>
                            <p style="color: #10b981; font-size: 24px; margin: 10px 0 0; font-weight: bold;">
                              Total: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>Next Steps:</strong>
                      </p>
                      <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Log into your account to view project details</li>
                        <li>Contact the homeowner to schedule the work</li>
                        <li>Review and sign the project agreement</li>
                        <li>Begin work according to the agreed timeline</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This notification was sent to ${contractorEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      Estimate Accepted - LeadGen Pro
      
      Congratulations ${contractorName}!
      
      ${homeownerName} has accepted your estimate for "${projectTitle}".
      
      Total: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      
      Next Steps:
      - Log into your account to view project details  
      - Contact the homeowner to schedule the work
      - Review and sign the project agreement
      - Begin work according to the agreed timeline
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'estimate accepted email');
    console.log('Estimate accepted notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send estimate accepted notification:', error);
    return { success: false, error };
  }
}

// Send new message notification
export async function sendNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages/${conversationId}`;

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: recipientEmail,
    subject: `New message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">💬 New Message</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${recipientName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        You have a new message from <strong>${senderName}</strong>:
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
                        <tr>
                          <td>
                            <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                              "${messagePreview.length > 150 ? messagePreview.substring(0, 150) + '...' : messagePreview}"
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              View Message
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        To manage your notification preferences, visit your account settings.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      New Message - LeadGen Pro
      
      Hi ${recipientName},
      
      You have a new message from ${senderName}:
      
      "${messagePreview}"
      
      View message: ${viewUrl}
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'new message notification email');
    console.log('New message notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send new message notification:', error);
    return { success: false, error };
  }
}

// Send contractor match results to homeowner
export async function sendMatchResultsEmail(
  recipientEmail: string,
  recipientName: string,
  projectType: string,
  totalMatches: number,
  topMatches: Array<{ name: string; matchScore: number; rating: number }>
) {
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contractors`;

  const topMatchesHtml = topMatches
    .slice(0, 3)
    .map(
      (match, index) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">#${index + 1} ${match.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">${match.matchScore}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef; text-align: right;">${match.rating.toFixed(1)} / 5</td>
        </tr>
      `
    )
    .join('');

  const topMatchesText = topMatches
    .slice(0, 3)
    .map((match, index) => `${index + 1}. ${match.name} - ${match.matchScore}% match - ${match.rating.toFixed(1)}/5 rating`)
    .join('\n');

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: recipientEmail,
    subject: `Your Contractor Matches Are Ready (${totalMatches} found)` ,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contractor Matches</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f766e 0%, #155e75 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 30px;">Top Contractor Matches</h1>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 16px; color: #334155;">Hi ${recipientName},</p>
                      <p style="margin: 0 0 16px; color: #334155;">
                        We found <strong>${totalMatches}</strong> contractors for your <strong>${projectType}</strong> project.
                      </p>

                      <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e9ecef; border-radius: 6px;">
                        <tr style="background-color: #f8fafc;">
                          <th style="padding: 10px; text-align: left;">Contractor</th>
                          <th style="padding: 10px; text-align: right;">Match</th>
                          <th style="padding: 10px; text-align: right;">Rating</th>
                        </tr>
                        ${topMatchesHtml}
                      </table>

                      <p style="margin: 24px 0 0; text-align: center;">
                        <a href="${viewUrl}" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: bold;">
                          View All Matches
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Hi ${recipientName},

We found ${totalMatches} contractors for your ${projectType} project.

Top matches:
${topMatchesText}

View all matches: ${viewUrl}
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'contractor match results email');
    console.log('Match results email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send match results email:', error);
    return { success: false, error };
  }
}

export async function sendEstimateRejectedEmail(
  contractorEmail: string,
  contractorName: string,
  homeownerName: string,
  projectTitle: string,
  estimateTotal: number
) {
  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: contractorEmail,
    subject: `Estimate Declined: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate Declined</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Estimate Update</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Your Estimate Was Declined</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${contractorName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        <strong>${homeownerName}</strong> has declined your estimate for "${projectTitle}".
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
                        <tr>
                          <td>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Homeowner:</strong> ${homeownerName}</p>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Project:</strong> ${projectTitle}</p>
                            <p style="color: #666666; font-size: 14px; margin: 10px 0 0;">
                              <strong>Estimate Amount:</strong> $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>What Now?</strong>
                      </p>
                      <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>You may reach out to the homeowner to discuss alternative options</li>
                        <li>Continue to look for other projects in your service area</li>
                        <li>Consider submitting revised estimates for future projects</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        This notification was sent to ${contractorEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      Estimate Declined - LeadGen Pro
      
      Hi ${contractorName},
      
      ${homeownerName} has declined your estimate for "${projectTitle}".
      
      Estimate Amount: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      
      What Now?
      - You may reach out to the homeowner to discuss alternative options
      - Continue to look for other projects in your service area
      - Consider submitting revised estimates for future projects
    `,
  };

  try {
    const info = await guardedSendMail(mailOptions, 'estimate rejected email');
    console.log('Estimate rejected notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send estimate rejected notification:', error);
    return { success: false, error };
  }
}

const emailService = {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEstimateNotificationEmail,
  sendEstimateAcceptedEmail,
  sendEstimateRejectedEmail,
  sendNewMessageEmail,
  sendMatchResultsEmail,
};

export default emailService;
