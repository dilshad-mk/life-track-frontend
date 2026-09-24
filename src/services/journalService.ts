import { apiClient } from './apiClient';
import { JournalEntry } from '../types';

export const journalService = {
  getJournalEntries: async (): Promise<JournalEntry[]> => {
    return apiClient.get<JournalEntry[]>('/journal');
  },

  getJournalByDate: async (date: string): Promise<JournalEntry | undefined> => {
    const res = await apiClient.get<JournalEntry | null>('/journal', { date });
    return res || undefined;
  },

  saveJournalEntry: async (
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> => {
    return apiClient.post<JournalEntry>('/journal', entry);
  },

  deleteJournalEntry: async (id: string): Promise<void> => {
    return apiClient.delete(`/journal/${id}`);
  },
};
