import nodemailer from 'nodemailer';

function parseEnvInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  connectionTimeout: parseEnvInt(process.env.SMTP_CONNECTION_TIMEOUT_MS, 10000),
  greetingTimeout: parseEnvInt(process.env.SMTP_GREETING_TIMEOUT_MS, 10000),
  socketTimeout: parseEnvInt(process.env.SMTP_SOCKET_TIMEOUT_MS, 15000),
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
};

// Create reusable transporter
export const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export function isEmailEnabled(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Verify connection configuration
export async function verifyEmailConnection() {
  const verifyTimeoutMs = parseEnvInt(process.env.SMTP_VERIFY_TIMEOUT_MS, 10000);
  try {
    await Promise.race([
      transporter.verify(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`SMTP verify timed out after ${verifyTimeoutMs}ms`)), verifyTimeoutMs);
      }),
    ]);
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
  console.info('[email-audit] entered sendVerificationEmail function', {
    email,
    userId,
    hasVerificationToken: Boolean(verificationToken),
    verificationTokenLength: verificationToken?.length ?? 0,
  });

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
  const smtpFromName = process.env.SMTP_FROM_NAME;

  const alternateFromEnvVars = {
    SMTP_FROM: process.env.SMTP_FROM,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MAIL_FROM: process.env.MAIL_FROM,
    FROM_EMAIL: process.env.FROM_EMAIL,
  };

  const fromAddress = process.env.SMTP_USER || 'noreply@leadgenpro.com';
  const fromName = 'LeadGen Pro';
  const hasCriticalSmtpEnv = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);
  const parsedSmtpPort = Number.parseInt(smtpPort || '', 10);
  const smtpPortLooksValid = Number.isFinite(parsedSmtpPort) && parsedSmtpPort > 0;

  console.info('[email-audit] sendVerificationEmail env audit', {
    hasSMTP_HOST: Boolean(smtpHost),
    hasSMTP_PORT: Boolean(smtpPort),
    hasSMTP_USER: Boolean(smtpUser),
    hasSMTP_PASS: Boolean(smtpPass),
    hasSMTP_FROM_EMAIL: Boolean(smtpFromEmail),
    hasSMTP_FROM_NAME: Boolean(smtpFromName),
    alternateEnvPresence: {
      SMTP_FROM: Boolean(alternateFromEnvVars.SMTP_FROM),
      EMAIL_FROM: Boolean(alternateFromEnvVars.EMAIL_FROM),
      MAIL_FROM: Boolean(alternateFromEnvVars.MAIL_FROM),
      FROM_EMAIL: Boolean(alternateFromEnvVars.FROM_EMAIL),
    },
    resolvedFromAddressSource: process.env.SMTP_USER ? 'SMTP_USER' : 'default(noreply@leadgenpro.com)',
    usesAlternateFromEnv: false,
    hasCriticalSmtpEnv,
    smtpPortLooksValid,
  });

  console.info('[email-audit] early-exit evaluation for sendVerificationEmail', {
    hasCriticalSmtpEnv,
    smtpPortLooksValid,
    exitsEarlyForMissingOrInvalidEnv: false,
    reason: 'No env-guard early-return is implemented; function proceeds to transporter.sendMail path.',
  });

  console.info('[email-audit] early return in email function and why', {
    earlyReturnExecuted: false,
    reason: 'No early return branch exists in sendVerificationEmail; function always proceeds to try/catch around sendMail.',
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&userId=${userId}`;

  const mailOptions = {
    from: {
      name: fromName,
      address: fromAddress,
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
    console.info('[email-audit] about to call transporter.sendMail for verification email', {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      userId,
    });

    const info = await transporter.sendMail(mailOptions);
    console.info('[email-audit] transporter.sendMail resolved for verification email', {
      to: mailOptions.to,
      from: mailOptions.from,
      messageId: info.messageId,
      userId,
    });
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[email-audit] transporter.sendMail threw for verification email', {
      to: mailOptions.to,
      from: mailOptions.from,
      userId,
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
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
    const info = await transporter.sendMail(mailOptions);
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
    const info = await transporter.sendMail(mailOptions);
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Estimate accepted notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send estimate accepted notification:', error);
    return { success: false, error };
  }
}

// Send estimate rejected notification to contractor
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
    subject: `Estimate Not Accepted: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Estimate Update</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${contractorName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        ${homeownerName} has chosen not to proceed with your estimate for "${projectTitle}".
                      </p>
                      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <tr>
                          <td>
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px;"><strong>Project:</strong> ${projectTitle}</p>
                            <p style="color: #666666; font-size: 14px; margin: 0;"><strong>Estimate Total:</strong> $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666666; font-size: 14px; line-height: 1.7; margin: 20px 0 0;">
                        Keep submitting quality proposals to improve your win rate over time.
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
      Estimate Not Accepted - LeadGen Pro

      Hi ${contractorName},

      ${homeownerName} has chosen not to proceed with your estimate for "${projectTitle}".

      Estimate Total: $${estimateTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

      Keep submitting quality proposals to improve your win rate over time.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Estimate rejected notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send estimate rejected notification:', error);
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
    const info = await transporter.sendMail(mailOptions);
    console.log('New message notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send new message notification:', error);
    return { success: false, error };
  }
}

export async function sendMatchResultsEmail(
  recipientEmail: string,
  recipientName: string,
  projectType: string,
  matchCount: number,
  matches: Array<{ name: string; matchScore: number; rating: number }>
) {
  if (!isEmailEnabled()) {
    return { success: false, error: 'email-disabled' };
  }

  const topMatches = matches.slice(0, 3);

  const mailOptions = {
    from: {
      name: 'LeadGen Pro',
      address: process.env.SMTP_USER || 'noreply@leadgenpro.com',
    },
    to: recipientEmail,
    subject: `Your contractor matches for ${projectType}`,
    html: `
      <h2>Contractor matches are ready</h2>
      <p>Hi ${recipientName},</p>
      <p>We found ${matchCount} contractor matches for your ${projectType} project.</p>
      <ul>
        ${topMatches
          .map(
            (match) =>
              `<li><strong>${match.name}</strong> - ${match.matchScore}% match, ${match.rating.toFixed(1)} rating</li>`
          )
          .join('')}
      </ul>
    `,
    text: `Hi ${recipientName}, we found ${matchCount} contractor matches for your ${projectType} project.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send match results email:', error);
    return { success: false, error };
  }
}

export default {
  verifyEmailConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEstimateNotificationEmail,
  sendEstimateAcceptedEmail,
  sendEstimateRejectedEmail,
  sendNewMessageEmail,
  sendMatchResultsEmail,
};
