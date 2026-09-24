import { apiClient, setAuthToken, clearAuthToken } from './apiClient';
import { User, AppSettings } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthToken();
    }
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  updateMe: async (updates: Partial<User>): Promise<User> => {
    return apiClient.patch<User>('/auth/me', updates);
  },

  getSettings: async (): Promise<AppSettings> => {
    return apiClient.get<AppSettings>('/auth/settings');
  },

  updateSettings: async (updates: Partial<AppSettings>): Promise<AppSettings> => {
    return apiClient.patch<AppSettings>('/auth/settings', updates);
  },
};
