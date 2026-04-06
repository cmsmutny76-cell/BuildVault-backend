import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '../../../../lib/email';
import {
  createVerificationToken,
  deleteVerificationToken,
  findUserByEmail,
  getVerificationToken,
  generateToken,
  updateUserByEmail,
} from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

/**
 * GET /api/auth/verify-email?token=xxx&userId=yyy
 * Verify user's email address
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing verification token or user ID' },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const tokenData = await getVerificationToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (tokenData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Token does not match user ID' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expiresAt) {
      await deleteVerificationToken(token);
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Find and update user
    const user = await findUserByEmail(tokenData.email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Mark user as verified
    await updateUserByEmail(tokenData.email, {
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    // Delete used token
    await deleteVerificationToken(token);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Resend verification email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    
    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link will be sent',
      });
    }

    if (user.verified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateToken();

    await createVerificationToken(verificationToken, {
      userId: user.id,
      email: email.toLowerCase(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.id, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email');
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
