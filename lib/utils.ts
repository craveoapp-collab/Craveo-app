/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Format error response
 */
export function formatErrorResponse(message: string, statusCode: number = 400) {
  return {
    error: message,
    statusCode,
  };
}

/**
 * Format success response
 */
export function formatSuccessResponse(data: any, message: string = 'Success') {
  return {
    message,
    data,
  };
}
