import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@craveo.app',
    to: email,
    subject: 'Verify your Craveo email',
    html: `
      <h1>Welcome to Craveo!</h1>
      <p>Hi ${firstName || 'there'},</p>
      <p>Please verify your email address to complete your registration.</p>
      <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p>Or copy and paste this link: ${verificationLink}</p>
      <p>This link expires in 24 hours.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@craveo.app',
    to: email,
    subject: 'Reset your Craveo password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${firstName || 'there'},</p>
      <p>We received a request to reset your password. Click the link below to set a new password.</p>
      <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
      <p>Or copy and paste this link: ${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendWishlistSharedEmail(
  email: string,
  senderName: string,
  wishlistTitle: string,
  wishlistLink: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@craveo.app',
    to: email,
    subject: `${senderName} shared a wishlist with you!`,
    html: `
      <h1>${senderName} shared a wishlist!</h1>
      <p>Hi there,</p>
      <p><strong>${senderName}</strong> shared their "${wishlistTitle}" wishlist with you on Craveo.</p>
      <a href="${wishlistLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Wishlist
      </a>
      <p>Join Craveo to purchase items and claim them!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendItemClaimedEmail(
  email: string,
  firstName: string,
  claimerName: string,
  itemName: string,
  wishlistTitle: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@craveo.app',
    to: email,
    subject: `${claimerName} is getting you "${itemName}"!`,
    html: `
      <h1>Item Claimed!</h1>
      <p>Hi ${firstName || 'there'},</p>
      <p><strong>${claimerName}</strong> claimed "${itemName}" from your "${wishlistTitle}" wishlist!</p>
      <p>You're all set - they'll be getting this for you soon.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}
