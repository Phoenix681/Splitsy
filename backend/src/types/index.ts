import type { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  userId?: string;
}

// JWT Payload structure
export interface JWTPayload {
  userId: string;
  email: string;
}

// Registration request body
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

// Login request body
export interface LoginBody {
  email: string;
  password: string;
}

// Auth response (after login/register)
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

// Generic API error response
export interface ErrorResponse {
  error: string;
  details?: string;
}