import crypto from 'crypto';

/**
 * Generate a secure token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token (for storing in database)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token by comparing with hashed version
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  return hashToken(token) === hashedToken;
}
