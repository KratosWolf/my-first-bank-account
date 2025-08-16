/**
 * Utility helper functions
 */

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(date?: Date): string {
  return (date || new Date()).toISOString();
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Sanitize error message for production
 */
export function sanitizeErrorMessage(error: Error): string {
  if (isProduction()) {
    return 'Internal Server Error';
  }
  return error.message;
}

/**
 * Create a delay promise for testing purposes
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}