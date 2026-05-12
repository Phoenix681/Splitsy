import api from './api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Group,
  GroupMember,
  Expense,
  CreateExpenseData,
  BalanceResponse,
  Settlement,
} from '../types';

// ========== AUTH API ==========
export const authApi = {
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

// ========== GROUPS API ==========
export const groupsApi = {
  getAll: async (): Promise<{ groups: Group[] }> => {
    const response = await api.get<{ groups: Group[] }>('/groups');
    return response.data;
  },

  getById: async (groupId: string): Promise<{ group: Group }> => {
    const response = await api.get<{ group: Group }>(`/groups/${groupId}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
  }): Promise<{ group: Group }> => {
    const response = await api.post<{ group: Group }>('/groups', data);
    return response.data;
  },

  addMember: async (
    groupId: string,
    email: string
  ): Promise<{ member: GroupMember }> => {
    const response = await api.post(`/groups/${groupId}/members`, { email });
    return response.data;
  },

  removeMember: async (
    groupId: string,
    memberId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/groups/${groupId}/members/${memberId}`
    );
    return response.data;
  },

  delete: async (groupId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },
};

// ========== EXPENSES API ==========
export const expensesApi = {
  getGroupExpenses: async (
    groupId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get(
      `/groups/${groupId}/expenses?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (expenseId: string): Promise<{ expense: Expense }> => {
    const response = await api.get<{ expense: Expense }>(
      `/expenses/${expenseId}`
    );
    return response.data;
  },

  create: async (
    groupId: string,
    data: CreateExpenseData
  ): Promise<{ expense: Expense }> => {
    const response = await api.post<{ expense: Expense }>(
      `/groups/${groupId}/expenses`,
      data
    );
    return response.data;
  },

  delete: async (expenseId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  },
};

// ========== BALANCES API ==========
export const balancesApi = {
  getGroupBalances: async (groupId: string): Promise<BalanceResponse> => {
    const response = await api.get<BalanceResponse>(
      `/groups/${groupId}/balances`
    );
    return response.data;
  },

  recordSettlement: async (
    groupId: string,
    data: {
      from_user_id: string;
      to_user_id: string;
      amount: number;
    }
  ): Promise<{ settlement: Settlement }> => {
    const response = await api.post(`/groups/${groupId}/settlements`, data);
    return response.data;
  },

  getSettlementHistory: async (
    groupId: string
  ): Promise<{ settlements: Settlement[]; count: number }> => {
    const response = await api.get(`/groups/${groupId}/settlements`);
    return response.data;
  },
};