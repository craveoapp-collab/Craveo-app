import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/token';
import { sendPasswordResetEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/utils';
import { applyRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitAllowed = await applyRateLimit(request);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with that email, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetTokenExpiry: resetTokenExpiry,
      },
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.firstName || '', resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return NextResponse.json(
      { message: 'If an account exists with that email, you will receive a password reset link.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
