/**
 * Shared configuration constants
 * Ensures consistency across the entire application
 */

export const JWT_SECRET = process.env.JWT_SECRET || 'splitsy-app-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
