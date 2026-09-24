import { apiClient } from './apiClient';
import { MemoryItem } from '../types';

export interface UploadResponse {
  id: string;
  url: string;
  type: string;
  filename: string;
  duration?: number;
}

export const mediaService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<UploadResponse>('/media/upload', formData);
  },

  uploadAudio: async (file: Blob | File, duration?: number): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file, 'voice-recording.webm');
    if (duration !== undefined) {
      formData.append('duration', String(duration));
    }
    return apiClient.upload<UploadResponse>('/media/audio', formData);
  },

  // Memories
  getMemories: async (): Promise<MemoryItem[]> => {
    return apiClient.get<MemoryItem[]>('/memories');
  },

  createMemory: async (
    item: Omit<MemoryItem, 'id' | 'createdAt'>
  ): Promise<MemoryItem> => {
    return apiClient.post<MemoryItem>('/memories', item);
  },

  toggleFavoriteMemory: async (id: string, isFavorite?: boolean): Promise<MemoryItem> => {
    return apiClient.patch<MemoryItem>(`/memories/${id}`, { isFavorite });
  },

  deleteMemory: async (id: string): Promise<void> => {
    return apiClient.delete(`/memories/${id}`);
  },
};
