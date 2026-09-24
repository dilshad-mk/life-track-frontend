import { apiClient } from './apiClient';
import { Goal, GoalCategory, Milestone } from '../types';

export const goalService = {
  getGoals: async (): Promise<Goal[]> => {
    return apiClient.get<Goal[]>('/goals');
  },

  getGoalById: async (id: string): Promise<Goal> => {
    return apiClient.get<Goal>(`/goals/${id}`);
  },

  createGoal: async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    return apiClient.post<Goal>('/goals', goal);
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    return apiClient.patch<Goal>(`/goals/${id}`, updates);
  },

  updateGoalProgress: async (id: string, currentValue: number): Promise<Goal> => {
    return apiClient.patch<Goal>(`/goals/${id}`, { currentValue });
  },

  deleteGoal: async (id: string): Promise<void> => {
    return apiClient.delete(`/goals/${id}`);
  },

  getCategories: async (): Promise<GoalCategory[]> => {
    return apiClient.get<GoalCategory[]>('/goal-categories');
  },

  createCategory: async (category: Omit<GoalCategory, 'id'>): Promise<GoalCategory> => {
    return apiClient.post<GoalCategory>('/goal-categories', category);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete(`/goal-categories/${id}`);
  },

  // Milestones
  getMilestones: async (goalId: string): Promise<Milestone[]> => {
    return apiClient.get<Milestone[]>(`/goals/${goalId}/milestones`);
  },

  createMilestone: async (
    goalId: string,
    milestone: { title: string; targetValue: number }
  ): Promise<Milestone> => {
    return apiClient.post<Milestone>(`/goals/${goalId}/milestones`, milestone);
  },

  updateMilestone: async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
    return apiClient.patch<Milestone>(`/milestones/${id}`, updates);
  },

  deleteMilestone: async (id: string): Promise<void> => {
    return apiClient.delete(`/milestones/${id}`);
  },
};
