import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// TODO: Replace with actual database
const mockUsers = new Map();
const passwordResetTokens = new Map(); // Map of token -> email

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    // If only email is provided, send reset link
    if (email && !token && !newPassword) {
      // TODO: Check if user exists in database
      const userExists = mockUsers.has(email.toLowerCase());
      
      if (!userExists) {
        // For security, don't reveal if email exists or not
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link',
        });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      passwordResetTokens.set(resetToken, {
        email: email.toLowerCase(),
        expiresAt: Date.now() + 3600000, // 1 hour
      });

      // TODO: Send email with reset link
      // await sendPasswordResetEmail(email, resetToken);

      return NextResponse.json({
        success: true,
        message: 'Password reset link sent to your email',
        // For development only - remove in production
        devToken: resetToken,
      });
    }

    // If token and new password provided, reset password
    if (token && newPassword) {
      const resetData = passwordResetTokens.get(token);
      
      if (!resetData) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }

      if (Date.now() > resetData.expiresAt) {
        passwordResetTokens.delete(token);
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
      const user = mockUsers.get(resetData.email);
      if (user) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = passwordHash;
        mockUsers.set(resetData.email, user);
      }

      // Invalidate token
      passwordResetTokens.delete(token);

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

function generateResetToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
