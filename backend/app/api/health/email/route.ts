import { NextRequest, NextResponse } from 'next/server';
import { isEmailEnabled, verifyEmailConnection } from '../../../../../lib/email';

function maskEmail(value: string | undefined): string | null {
  if (!value || !value.includes('@')) {
    return null;
  }

  const [localPart, domain] = value.split('@');
  if (!domain) {
    return null;
  }

  const maskedLocal = localPart.length <= 2
    ? `${localPart.charAt(0) || '*'}*`
    : `${localPart.slice(0, 2)}***`;

  return `${maskedLocal}@${domain}`;
}

/**
 * GET /api/health/email
 * Optional query:
 * - verify=true -> performs live SMTP connection test with transporter.verify()
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldVerify = searchParams.get('verify') === 'true';

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;

    const configured = isEmailEnabled();

    let verified: boolean | null = null;
    if (shouldVerify && configured) {
      verified = await verifyEmailConnection();
    }

    const statusCode = shouldVerify
      ? verified
        ? 200
        : 503
      : configured
        ? 200
        : 503;

    return NextResponse.json(
      {
        success: configured,
        service: 'email',
        configured,
        verified,
        provider: smtpHost || null,
        port: smtpPort || null,
        user: maskEmail(smtpUser),
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Email health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        service: 'email',
        configured: false,
        verified: false,
        error: 'Email health check failed',
      },
      { status: 500 }
    );
  }
}
