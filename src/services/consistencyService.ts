import { apiClient } from './apiClient';
import { ConsistencyDay } from '../types';

export interface ConsistencyResponse {
  currentStreak: number;
  longestStreak: number;
  weeklyConsistency: number;
  monthlyConsistency: number;
  dailyActivity: ConsistencyDay[];
}

export const consistencyService = {
  getConsistencyData: async (startDate?: string, endDate?: string): Promise<ConsistencyDay[]> => {
    const res = await apiClient.get<ConsistencyResponse>('/consistency', { startDate, endDate });
    return res.dailyActivity || [];
  },

  getConsistencySummary: async (): Promise<ConsistencyResponse> => {
    return apiClient.get<ConsistencyResponse>('/consistency');
  },
};
