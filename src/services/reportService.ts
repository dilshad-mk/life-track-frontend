import { apiClient } from './apiClient';

export interface DailyReportData {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  dailyExpenses: number;
}

export interface MonthlyReportData {
  month: string;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  productiveDays: number;
  currentStreak: number;
  longestStreak: number;
  activeGoals: number;
  goalsProgressAvg: number;
  income: number;
  expenses: number;
  savings: number;
  bucketCompleted: number;
  bucketTotal: number;
}

export interface MonthlyComparisonData {
  month1: {
    name: string;
    income: number;
    expenses: number;
    savings: number;
    taskCompletionRate: number;
  };
  month2: {
    name: string;
    income: number;
    expenses: number;
    savings: number;
    taskCompletionRate: number;
  };
  delta: {
    incomeChange: number;
    expenseChange: number;
    savingsChange: number;
    completionRateChange: number;
  };
}

export const reportService = {
  getDailyReport: async (date?: string): Promise<DailyReportData> => {
    return apiClient.get<DailyReportData>('/reports/daily', { date });
  },

  getMonthlyReport: async (month?: string): Promise<MonthlyReportData> => {
    return apiClient.get<MonthlyReportData>('/reports/monthly', { month });
  },

  getMonthlyComparison: async (
    month1?: string,
    month2?: string
  ): Promise<MonthlyComparisonData> => {
    return apiClient.get<MonthlyComparisonData>('/reports/monthly/comparison', { month1, month2 });
  },
};
