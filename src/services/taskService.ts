import { apiClient } from './apiClient';
import { Task, TaskCategory } from '../types';

export interface TaskFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  completed?: boolean;
  priority?: string;
}

export const taskService = {
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    return apiClient.get<Task[]>('/tasks', filters);
  },

  getTaskById: async (id: string): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    return apiClient.post<Task>('/tasks', task);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}`, updates);
  },

  toggleTaskComplete: async (id: string, completed?: boolean): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}`, {
      ...(completed !== undefined ? { completed } : {}),
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return apiClient.delete(`/tasks/${id}`);
  },

  // Categories
  getCategories: async (): Promise<TaskCategory[]> => {
    return apiClient.get<TaskCategory[]>('/task-categories');
  },

  createCategory: async (category: Omit<TaskCategory, 'id'>): Promise<TaskCategory> => {
    return apiClient.post<TaskCategory>('/task-categories', category);
  },

  updateCategory: async (id: string, updates: Partial<TaskCategory>): Promise<TaskCategory> => {
    return apiClient.patch<TaskCategory>(`/task-categories/${id}`, updates);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete(`/task-categories/${id}`);
  },
};
