import { apiClient } from './apiClient';
import { Task, Goal, BucketItem } from '../types';

export interface DashboardResponse {
  today: {
    date: string;
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
    completionPercentage: number;
    tasks: Task[];
  };
  goals: Goal[];
  finance: {
    currentSavings: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
  };
  consistency: {
    currentStreak: number;
    longestStreak: number;
    monthlyPercentage: number;
  };
  bucketList: {
    total: number;
    completed: number;
    upcoming?: BucketItem;
  };
}

export const dashboardService = {
  getDashboardData: async (date?: string): Promise<DashboardResponse> => {
    return apiClient.get<DashboardResponse>('/dashboard', { date });
  },
};
