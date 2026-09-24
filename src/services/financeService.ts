import { apiClient } from './apiClient';
import { Transaction, FinanceCategory } from '../types';

export interface FinancialSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  currentWealth: number;
  transactionCount: number;
}

export interface MonthlyBarSummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategorySummaryItem {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
}

export interface FinancialComparison {
  yoyIncomeGrowth: number;
  lastYearIncome: number;
  currentIncome: number;
  yoySurplusGrowth: number;
  lastYearSurplus: number;
  currentSurplus: number;
}

export const financeService = {
  getTransactions: async (): Promise<Transaction[]> => {
    return apiClient.get<Transaction[]>('/transactions');
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  createTransaction: async (
    tx: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<Transaction> => {
    return apiClient.post<Transaction>('/transactions', tx);
  },

  deleteTransaction: async (id: string): Promise<void> => {
    return apiClient.delete(`/transactions/${id}`);
  },

  getCategories: async (): Promise<FinanceCategory[]> => {
    return apiClient.get<FinanceCategory[]>('/finance-categories');
  },

  createCategory: async (category: Omit<FinanceCategory, 'id'>): Promise<FinanceCategory> => {
    return apiClient.post<FinanceCategory>('/finance-categories', category);
  },

  // Financial Analytics
  getSummary: async (month?: string): Promise<FinancialSummary> => {
    return apiClient.get<FinancialSummary>('/finance/summary', { month });
  },

  getMonthlySummary: async (): Promise<MonthlyBarSummary[]> => {
    return apiClient.get<MonthlyBarSummary[]>('/finance/monthly-summary');
  },

  getCategorySummary: async (): Promise<CategorySummaryItem[]> => {
    return apiClient.get<CategorySummaryItem[]>('/finance/category-summary');
  },

  getComparison: async (): Promise<FinancialComparison> => {
    return apiClient.get<FinancialComparison>('/finance/comparison');
  },
};

export const pendingFundService = {
  getPendingFunds: async (): Promise<import('../types').PendingFund[]> => {
    return apiClient.get<import('../types').PendingFund[]>('/pending-funds');
  },

  createPendingFund: async (
    item: Omit<import('../types').PendingFund, 'id' | 'createdAt' | 'updatedAt' | 'receivedAmount' | 'status'>
  ): Promise<import('../types').PendingFund> => {
    return apiClient.post<import('../types').PendingFund>('/pending-funds', item);
  },

  updatePendingFund: async (
    id: string,
    updates: Partial<import('../types').PendingFund>
  ): Promise<import('../types').PendingFund> => {
    return apiClient.put<import('../types').PendingFund>(`/pending-funds/${id}`, updates);
  },

  deletePendingFund: async (id: string): Promise<void> => {
    return apiClient.delete(`/pending-funds/${id}`);
  },

  receiveFund: async (
    id: string,
    payload: {
      receiveAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
    }
  ): Promise<{ pendingFund: import('../types').PendingFund; transaction: Transaction; message: string }> => {
    return apiClient.post(`/pending-funds/${id}/receive`, payload);
  },
};

export const debtService = {
  getDebts: async (): Promise<import('../types').Debt[]> => {
    return apiClient.get<import('../types').Debt[]>('/debts');
  },

  createDebt: async (
    item: Omit<import('../types').Debt, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'status'>
  ): Promise<import('../types').Debt> => {
    return apiClient.post<import('../types').Debt>('/debts', item);
  },

  updateDebt: async (
    id: string,
    updates: Partial<import('../types').Debt>
  ): Promise<import('../types').Debt> => {
    return apiClient.put<import('../types').Debt>(`/debts/${id}`, updates);
  },

  deleteDebt: async (id: string): Promise<void> => {
    return apiClient.delete(`/debts/${id}`);
  },

  repayDebt: async (
    id: string,
    payload: {
      repayAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
      logExpense?: boolean;
    }
  ): Promise<{ debt: import('../types').Debt; transaction?: Transaction | null; message: string }> => {
    return apiClient.post(`/debts/${id}/repay`, payload);
  },
};

