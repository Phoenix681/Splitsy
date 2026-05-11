import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import { verifyToken } from '../utils/auth.js';

/**
 * Middleware to verify JWT token and attach userId to request
 * Usage: Add this middleware to any route that requires authentication
 * 
 * Example:
 * router.get('/protected', authMiddleware, controller);
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach userId to request object for use in controllers
    req.userId = payload.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};