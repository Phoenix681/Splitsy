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

// Create group request body
export interface CreateGroupBody {
  name: string;
  description?: string;
}

// Add member request body
export interface AddMemberBody {
  email: string;
}

// Group with member count
export interface GroupWithMembers {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  memberCount: number;
}

// Split detail for expense creation
export interface SplitDetail {
  user_id: string;
  amount: number;
}

// Create expense request body
export interface CreateExpenseBody {
  description: string;
  amount: number;
  paid_by: string; // user_id of payer
  split_type: 'equal' | 'custom';
  splits?: SplitDetail[]; // Required if split_type is 'custom'
  split_among?: string[]; // User IDs to split equally among (if split_type is 'equal')
}

// Generic API error response
export interface ErrorResponse {
  error: string;
  details?: string;
}