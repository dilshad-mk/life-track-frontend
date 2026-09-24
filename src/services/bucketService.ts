import { apiClient } from './apiClient';
import { BucketItem, BucketCategory } from '../types';

export const bucketService = {
  getBucketItems: async (): Promise<BucketItem[]> => {
    return apiClient.get<BucketItem[]>('/bucket-list');
  },

  getBucketItemById: async (id: string): Promise<BucketItem> => {
    return apiClient.get<BucketItem>(`/bucket-list/${id}`);
  },

  createBucketItem: async (item: Omit<BucketItem, 'id' | 'createdAt'>): Promise<BucketItem> => {
    return apiClient.post<BucketItem>('/bucket-list', item);
  },

  updateBucketItem: async (id: string, updates: Partial<BucketItem>): Promise<BucketItem> => {
    return apiClient.patch<BucketItem>(`/bucket-list/${id}`, updates);
  },

  deleteBucketItem: async (id: string): Promise<void> => {
    return apiClient.delete(`/bucket-list/${id}`);
  },

  getCategories: async (): Promise<BucketCategory[]> => {
    return apiClient.get<BucketCategory[]>('/bucket-categories');
  },

  createCategory: async (category: Omit<BucketCategory, 'id'>): Promise<BucketCategory> => {
    return apiClient.post<BucketCategory>('/bucket-categories', category);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete(`/bucket-categories/${id}`);
  },
};
