import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '../../../../lib/email';
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  findUserByEmail,
  generateToken,
  getPasswordResetToken,
  updateUserByEmail,
} from '../../../../lib/server/authStore';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    // If only email is provided, send reset link
    if (email && !token && !newPassword) {
      // TODO: Check if user exists in database
      const userExists = await findUserByEmail(email);
      
      if (!userExists) {
        // For security, don't reveal if email exists or not
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link',
        });
      }

      // Generate reset token
      const resetToken = generateToken();
      await createPasswordResetToken(resetToken, {
        email: email.toLowerCase(),
        expiresAt: Date.now() + 3600000, // 1 hour
      });

      // Send email with reset link
      const emailResult = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailResult.success) {
        console.error('Failed to send password reset email');
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset link sent to your email',
        // For development only - remove in production
        devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      });
    }

    // If token and new password provided, reset password
    if (token && newPassword) {
      const resetData = await getPasswordResetToken(token);
      
      if (!resetData) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      if (Date.now() > resetData.expiresAt) {
        await deletePasswordResetToken(token);
        return NextResponse.json(
          { success: false, error: 'Reset token has expired' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Update password
      const user = await findUserByEmail(resetData.email);
      if (user) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await updateUserByEmail(resetData.email, { passwordHash });
      }

      // Invalidate token
      await deletePasswordResetToken(token);

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
