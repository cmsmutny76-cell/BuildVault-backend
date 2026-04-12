import { NextRequest, NextResponse } from 'next/server';
import { isEmailEnabled, verifyEmailConnection } from '../../../../../lib/email';

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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
    const verifyTimeoutMs = parsePositiveInt(process.env.EMAIL_HEALTH_VERIFY_TIMEOUT_MS, 12000);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;

    const configured = isEmailEnabled();

    let verified: boolean | null = null;
    let verifyError: string | null = null;
    if (shouldVerify && configured) {
      const result = await Promise.race<{ ok: boolean; error?: string }>([
        verifyEmailConnection(),
        new Promise<{ ok: boolean; error?: string }>((resolve) => {
          setTimeout(() => resolve({ ok: false, error: 'timeout' }), verifyTimeoutMs);
        }),
      ]);
      verified = result.ok;
      verifyError = result.error ?? null;
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
        verifyError,
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
