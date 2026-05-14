// User types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  joined_at?: string;
  memberCount?: number;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  joined_at: string;
}

// Expense types
export interface Expense {
  id: string;
  description: string;
  amount: string;
  created_at: string;
  payer: {
    id: string;
    name: string;
  };
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  user_id: string;
  user_name: string;
  amount: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  paid_by: string;
  split_type: 'equal' | 'custom' | 'percentage';
  splits?: { user_id: string; amount: number }[];
  split_among?: string[];
}

// Settlement types
export interface SettlementRecord {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
  };
  to: {
    id: string;
    name: string;
    email: string;
  };
  amount: string;
  settled_at: string;
}

// Activity types (unified feed)
export type Activity = 
  | (Expense & { type: 'expense' })
  | (SettlementRecord & { type: 'settlement' });


// Balance types
export interface UserBalance {
  user_id: string;
  user_name: string;
  net_balance: number;
}

export interface Settlement {
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  amount: number;
}

export interface BalanceResponse {
  group_id: string;
  balances: UserBalance[];
  settlements: Settlement[];
  expense_breakdown: {
    user_id: string;
    user_name: string;
    total_paid: number;
    total_owed: number;
    net_balance: number;
  }[];
  summary: {
    total_expenses: number;
    total_amount: number;
    settlements_needed: number;
  };
}

// API Error
export interface ApiError {
  error: string;
  details?: string;
}