import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email configuration - update these with your email service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a random token for email verification or password reset
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token (for secure storage in database)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@craveo.com',
    to: email,
    subject: 'Verify Your Craveo Email Address',
    html: `
      <h1>Welcome to Craveo!</h1>
      <p>Hi ${firstName || 'there'},</p>
      <p>Thank you for signing up. Please verify your email address to get started.</p>
      <p><a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Verify Email</a></p>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>Best regards,<br>The Craveo Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@craveo.com',
    to: email,
    subject: 'Reset Your Craveo Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${firstName || 'there'},</p>
      <p>We received a request to reset your Craveo password.</p>
      <p><a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>Best regards,<br>The Craveo Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}
