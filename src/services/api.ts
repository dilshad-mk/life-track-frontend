import {
  Task,
  TaskCategory,
  Goal,
  GoalCategory,
  BucketItem,
  BucketCategory,
  Transaction,
  FinanceCategory,
  JournalEntry,
  User,
  AppSettings,
  ConsistencyDay,
  MemoryItem,
  PendingFund,
  Debt,
} from '../types';

import { authService } from './authService';
import { taskService, TaskFilters } from './taskService';
import { goalService } from './goalService';
import { bucketService } from './bucketService';
import { financeService, pendingFundService, debtService } from './financeService';

import { reportService } from './reportService';
import { consistencyService } from './consistencyService';
import { journalService } from './journalService';
import { mediaService, UploadResponse } from './mediaService';
import { dashboardService } from './dashboardService';

import {
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_TASK_CATEGORIES,
  INITIAL_GOAL_CATEGORIES,
  INITIAL_BUCKET_CATEGORIES,
  INITIAL_FINANCE_CATEGORIES,
} from './mockData';

const USE_MOCK = false;

// Helper to gracefully fallback if server fails or not yet authenticated
async function withFallback<T>(fn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fallbackFn();
  }
}

// Local storage fallback helpers
const STORAGE_KEYS = {
  USER: 'lifetrack_user',
  SETTINGS: 'lifetrack_settings',
  TASKS: 'lifetrack_tasks',
  TASK_CATEGORIES: 'lifetrack_task_categories',
  GOALS: 'lifetrack_goals',
  GOAL_CATEGORIES: 'lifetrack_goal_categories',
  BUCKET_ITEMS: 'lifetrack_bucket_items',
  BUCKET_CATEGORIES: 'lifetrack_bucket_categories',
  TRANSACTIONS: 'lifetrack_transactions',
  FINANCE_CATEGORIES: 'lifetrack_finance_categories',
  JOURNAL: 'lifetrack_journal',
  MEMORIES: 'lifetrack_memories',
  PENDING_FUNDS: 'lifetrack_pending_funds',
  DEBTS: 'lifetrack_debts',
};


function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore
  }
}

/**
 * Unified API Client Facade
 * Directly communicates with the real REST API backend,
 * with graceful fallback to local storage if offline.
 */
export const api = {
  isMockMode: () => USE_MOCK,

  // --- AUTH & USER ---
  login: authService.login,
  register: authService.register,
  logout: authService.logout,

  getUser: async (): Promise<User> => {
    return withFallback(
      () => authService.getMe(),
      async () => getStored<User>(STORAGE_KEYS.USER, INITIAL_USER)
    );
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    return withFallback(
      () => authService.updateMe(updates),
      async () => {
        const u = await api.getUser();
        const updated = { ...u, ...updates };
        setStored(STORAGE_KEYS.USER, updated);
        return updated;
      }
    );
  },

  updateAvatar: async (avatarUrl: string): Promise<User> => {
    return api.updateUser({ avatarUrl });
  },

  getSettings: async (): Promise<AppSettings> => {
    return withFallback(
      () => authService.getSettings(),
      async () => getStored<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
    );
  },

  updateSettings: async (updates: Partial<AppSettings>): Promise<AppSettings> => {
    return withFallback(
      () => authService.updateSettings(updates),
      async () => {
        const s = await api.getSettings();
        const updated = { ...s, ...updates };
        setStored(STORAGE_KEYS.SETTINGS, updated);
        return updated;
      }
    );
  },

  // --- TASKS ---
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    return withFallback(
      () => taskService.getTasks(filters),
      async () => getStored<Task[]>(STORAGE_KEYS.TASKS, [])
    );
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    return withFallback(
      () => taskService.createTask(task),
      async () => {
        const tasks = getStored<Task[]>(STORAGE_KEYS.TASKS, []);
        const newTask: Task = {
          ...task,
          id: `tsk_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks.unshift(newTask);
        setStored(STORAGE_KEYS.TASKS, tasks);
        return newTask;
      }
    );
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return withFallback(
      () => taskService.updateTask(id, updates),
      async () => {
        const tasks = getStored<Task[]>(STORAGE_KEYS.TASKS, []);
        const index = tasks.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Task not found');
        const updated = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
        tasks[index] = updated;
        setStored(STORAGE_KEYS.TASKS, tasks);
        return updated;
      }
    );
  },

  toggleTaskComplete: async (id: string): Promise<Task> => {
    return withFallback(
      () => taskService.toggleTaskComplete(id),
      async () => {
        const tasks = getStored<Task[]>(STORAGE_KEYS.TASKS, []);
        const index = tasks.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Task not found');
        const isComp = !tasks[index].completed;
        const updated = {
          ...tasks[index],
          completed: isComp,
          completedAt: isComp ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
        tasks[index] = updated;
        setStored(STORAGE_KEYS.TASKS, tasks);
        return updated;
      }
    );
  },

  deleteTask: async (id: string): Promise<void> => {
    return withFallback(
      () => taskService.deleteTask(id),
      async () => {
        const tasks = getStored<Task[]>(STORAGE_KEYS.TASKS, []);
        setStored(STORAGE_KEYS.TASKS, tasks.filter((t) => t.id !== id));
      }
    );
  },

  // --- TASK CATEGORIES ---
  getTaskCategories: async (): Promise<TaskCategory[]> => {
    return withFallback(
      () => taskService.getCategories(),
      async () => getStored<TaskCategory[]>(STORAGE_KEYS.TASK_CATEGORIES, INITIAL_TASK_CATEGORIES)
    );
  },

  createTaskCategory: async (category: Omit<TaskCategory, 'id'>): Promise<TaskCategory> => {
    return withFallback(
      () => taskService.createCategory(category),
      async () => {
        const cats = getStored<TaskCategory[]>(STORAGE_KEYS.TASK_CATEGORIES, INITIAL_TASK_CATEGORIES);
        const newCat = { ...category, id: `cat_${Date.now()}` };
        cats.push(newCat);
        setStored(STORAGE_KEYS.TASK_CATEGORIES, cats);
        return newCat;
      }
    );
  },

  deleteTaskCategory: async (id: string): Promise<void> => {
    return withFallback(
      () => taskService.deleteCategory(id),
      async () => {
        const cats = getStored<TaskCategory[]>(STORAGE_KEYS.TASK_CATEGORIES, INITIAL_TASK_CATEGORIES);
        setStored(STORAGE_KEYS.TASK_CATEGORIES, cats.filter((c) => c.id !== id));
      }
    );
  },

  // --- GOALS ---
  getGoals: async (): Promise<Goal[]> => {
    return withFallback(
      () => goalService.getGoals(),
      async () => getStored<Goal[]>(STORAGE_KEYS.GOALS, [])
    );
  },

  createGoal: async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    return withFallback(
      () => goalService.createGoal(goal),
      async () => {
        const goals = getStored<Goal[]>(STORAGE_KEYS.GOALS, []);
        const newGoal = { ...goal, id: `goal_${Date.now()}`, createdAt: new Date().toISOString() };
        goals.unshift(newGoal as Goal);
        setStored(STORAGE_KEYS.GOALS, goals);
        return newGoal as Goal;
      }
    );
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    return withFallback(
      () => goalService.updateGoal(id, updates),
      async () => {
        const goals = getStored<Goal[]>(STORAGE_KEYS.GOALS, []);
        const idx = goals.findIndex((g) => g.id === id);
        if (idx === -1) throw new Error('Goal not found');
        const updated = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
        goals[idx] = updated;
        setStored(STORAGE_KEYS.GOALS, goals);
        return updated;
      }
    );
  },

  updateGoalProgress: async (id: string, currentValue: number): Promise<Goal> => {
    return withFallback(
      () => goalService.updateGoalProgress(id, currentValue),
      async () => {
        const goals = getStored<Goal[]>(STORAGE_KEYS.GOALS, []);
        const idx = goals.findIndex((g) => g.id === id);
        if (idx === -1) throw new Error('Goal not found');
        const updated = {
          ...goals[idx],
          currentValue,
          progress: Math.min(100, Math.round((currentValue / goals[idx].targetValue) * 100)),
        };
        goals[idx] = updated;
        setStored(STORAGE_KEYS.GOALS, goals);
        return updated;
      }
    );
  },

  deleteGoal: async (id: string): Promise<void> => {
    return withFallback(
      () => goalService.deleteGoal(id),
      async () => {
        const goals = getStored<Goal[]>(STORAGE_KEYS.GOALS, []);
        setStored(STORAGE_KEYS.GOALS, goals.filter((g) => g.id !== id));
      }
    );
  },

  getGoalCategories: async (): Promise<GoalCategory[]> => {
    return withFallback(
      () => goalService.getCategories(),
      async () => getStored<GoalCategory[]>(STORAGE_KEYS.GOAL_CATEGORIES, INITIAL_GOAL_CATEGORIES)
    );
  },

  createGoalCategory: async (category: Omit<GoalCategory, 'id'>): Promise<GoalCategory> => {
    return withFallback(
      () => goalService.createCategory(category),
      async () => {
        const cats = getStored<GoalCategory[]>(STORAGE_KEYS.GOAL_CATEGORIES, INITIAL_GOAL_CATEGORIES);
        const newCat = { ...category, id: `gcat_${Date.now()}` };
        cats.push(newCat);
        setStored(STORAGE_KEYS.GOAL_CATEGORIES, cats);
        return newCat;
      }
    );
  },

  // --- BUCKET LIST ---
  getBucketItems: async (): Promise<BucketItem[]> => {
    return withFallback(
      () => bucketService.getBucketItems(),
      async () => getStored<BucketItem[]>(STORAGE_KEYS.BUCKET_ITEMS, [])
    );
  },

  createBucketItem: async (item: Omit<BucketItem, 'id' | 'createdAt'>): Promise<BucketItem> => {
    return withFallback(
      () => bucketService.createBucketItem(item),
      async () => {
        const items = getStored<BucketItem[]>(STORAGE_KEYS.BUCKET_ITEMS, []);
        const newItem = { ...item, id: `bkt_${Date.now()}`, createdAt: new Date().toISOString() };
        items.unshift(newItem as BucketItem);
        setStored(STORAGE_KEYS.BUCKET_ITEMS, items);
        return newItem as BucketItem;
      }
    );
  },

  updateBucketItem: async (id: string, updates: Partial<BucketItem>): Promise<BucketItem> => {
    return withFallback(
      () => bucketService.updateBucketItem(id, updates),
      async () => {
        const items = getStored<BucketItem[]>(STORAGE_KEYS.BUCKET_ITEMS, []);
        const idx = items.findIndex((b) => b.id === id);
        if (idx === -1) throw new Error('Bucket item not found');
        const updated = { ...items[idx], ...updates };
        items[idx] = updated;
        setStored(STORAGE_KEYS.BUCKET_ITEMS, items);
        return updated;
      }
    );
  },

  deleteBucketItem: async (id: string): Promise<void> => {
    return withFallback(
      () => bucketService.deleteBucketItem(id),
      async () => {
        const items = getStored<BucketItem[]>(STORAGE_KEYS.BUCKET_ITEMS, []);
        setStored(STORAGE_KEYS.BUCKET_ITEMS, items.filter((b) => b.id !== id));
      }
    );
  },

  getBucketCategories: async (): Promise<BucketCategory[]> => {
    return withFallback(
      () => bucketService.getCategories(),
      async () => getStored<BucketCategory[]>(STORAGE_KEYS.BUCKET_CATEGORIES, INITIAL_BUCKET_CATEGORIES)
    );
  },

  createBucketCategory: async (category: Omit<BucketCategory, 'id'>): Promise<BucketCategory> => {
    return withFallback(
      () => bucketService.createCategory(category),
      async () => {
        const cats = getStored<BucketCategory[]>(STORAGE_KEYS.BUCKET_CATEGORIES, INITIAL_BUCKET_CATEGORIES);
        const newCat = { ...category, id: `bcat_${Date.now()}` };
        cats.push(newCat);
        setStored(STORAGE_KEYS.BUCKET_CATEGORIES, cats);
        return newCat;
      }
    );
  },

  // --- FINANCE ---
  getTransactions: async (): Promise<Transaction[]> => {
    return withFallback(
      () => financeService.getTransactions(),
      async () => getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
    );
  },

  createTransaction: async (tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    return withFallback(
      () => financeService.createTransaction(tx),
      async () => {
        const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        const newTx = { ...tx, id: `tx_${Date.now()}`, createdAt: new Date().toISOString() };
        txs.unshift(newTx as Transaction);
        setStored(STORAGE_KEYS.TRANSACTIONS, txs);
        return newTx as Transaction;
      }
    );
  },

  deleteTransaction: async (id: string): Promise<void> => {
    return withFallback(
      () => financeService.deleteTransaction(id),
      async () => {
        const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        setStored(STORAGE_KEYS.TRANSACTIONS, txs.filter((t) => t.id !== id));
      }
    );
  },

  getFinanceCategories: async (): Promise<FinanceCategory[]> => {
    return withFallback(
      () => financeService.getCategories(),
      async () => getStored<FinanceCategory[]>(STORAGE_KEYS.FINANCE_CATEGORIES, INITIAL_FINANCE_CATEGORIES)
    );
  },

  createFinanceCategory: async (category: Omit<FinanceCategory, 'id'>): Promise<FinanceCategory> => {
    return withFallback(
      () => financeService.createCategory(category),
      async () => {
        const cats = getStored<FinanceCategory[]>(STORAGE_KEYS.FINANCE_CATEGORIES, []);
        const newCat = { ...category, id: `fc_${Date.now()}` };
        cats.push(newCat);
        setStored(STORAGE_KEYS.FINANCE_CATEGORIES, cats);
        return newCat;
      }
    );
  },

  getFinanceSummary: financeService.getSummary,
  getMonthlyFinanceSummary: financeService.getMonthlySummary,
  getFinanceCategorySummary: financeService.getCategorySummary,
  getFinanceComparison: financeService.getComparison,

  // --- PENDING FUNDS (MONEY NOT IN HAND / RECEIVABLES) ---
  getPendingFunds: async (): Promise<PendingFund[]> => {
    return withFallback(
      () => pendingFundService.getPendingFunds(),
      async () => getStored<PendingFund[]>(STORAGE_KEYS.PENDING_FUNDS, [])
    );
  },

  createPendingFund: async (
    item: Omit<PendingFund, 'id' | 'createdAt' | 'updatedAt' | 'receivedAmount' | 'status'>
  ): Promise<PendingFund> => {
    return withFallback(
      () => pendingFundService.createPendingFund(item),
      async () => {
        const items = getStored<PendingFund[]>(STORAGE_KEYS.PENDING_FUNDS, []);
        const newItem: PendingFund = {
          ...item,
          id: `pf_${Date.now()}`,
          receivedAmount: 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        items.unshift(newItem);
        setStored(STORAGE_KEYS.PENDING_FUNDS, items);
        return newItem;
      }
    );
  },

  updatePendingFund: async (id: string, updates: Partial<PendingFund>): Promise<PendingFund> => {
    return withFallback(
      () => pendingFundService.updatePendingFund(id, updates),
      async () => {
        const items = getStored<PendingFund[]>(STORAGE_KEYS.PENDING_FUNDS, []);
        const idx = items.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error('Pending fund not found');
        const updated = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
        items[idx] = updated;
        setStored(STORAGE_KEYS.PENDING_FUNDS, items);
        return updated;
      }
    );
  },

  deletePendingFund: async (id: string): Promise<void> => {
    return withFallback(
      () => pendingFundService.deletePendingFund(id),
      async () => {
        const items = getStored<PendingFund[]>(STORAGE_KEYS.PENDING_FUNDS, []);
        setStored(STORAGE_KEYS.PENDING_FUNDS, items.filter((p) => p.id !== id));
      }
    );
  },

  receivePendingFund: async (
    id: string,
    payload: {
      receiveAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
    }
  ): Promise<{ pendingFund: PendingFund; transaction: Transaction; message: string }> => {
    return withFallback(
      () => pendingFundService.receiveFund(id, payload),
      async () => {
        const items = getStored<PendingFund[]>(STORAGE_KEYS.PENDING_FUNDS, []);
        const idx = items.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error('Pending fund not found');
        const current = items[idx];
        const amount = Number(payload.receiveAmount) || (current.amount - current.receivedAmount);
        const newReceived = current.receivedAmount + amount;
        const updatedFund: PendingFund = {
          ...current,
          receivedAmount: newReceived,
          status: newReceived >= current.amount ? 'received' : 'partially_received',
          updatedAt: new Date().toISOString(),
        };
        items[idx] = updatedFund;
        setStored(STORAGE_KEYS.PENDING_FUNDS, items);

        // Add income transaction
        const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          amount,
          type: 'income',
          categoryId: payload.categoryId || 'cat_salary',
          date: payload.date || new Date().toISOString().split('T')[0],
          description: payload.description || `Received from ${current.fromWhom} (${current.title})`,
          paymentMethod: (payload.paymentMethod as any) || 'Bank Transfer',
          createdAt: new Date().toISOString(),
        };
        txs.unshift(newTx);
        setStored(STORAGE_KEYS.TRANSACTIONS, txs);

        return {
          pendingFund: updatedFund,
          transaction: newTx,
          message: 'Received successfully',
        };
      }
    );
  },

  // --- DEBTS (MONEY I OWE / LIABILITIES) ---
  getDebts: async (): Promise<Debt[]> => {
    return withFallback(
      () => debtService.getDebts(),
      async () => getStored<Debt[]>(STORAGE_KEYS.DEBTS, [])
    );
  },

  createDebt: async (
    item: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'status'>
  ): Promise<Debt> => {
    return withFallback(
      () => debtService.createDebt(item),
      async () => {
        const items = getStored<Debt[]>(STORAGE_KEYS.DEBTS, []);
        const newItem: Debt = {
          ...item,
          id: `debt_${Date.now()}`,
          paidAmount: 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        items.unshift(newItem);
        setStored(STORAGE_KEYS.DEBTS, items);
        return newItem;
      }
    );
  },

  updateDebt: async (id: string, updates: Partial<Debt>): Promise<Debt> => {
    return withFallback(
      () => debtService.updateDebt(id, updates),
      async () => {
        const items = getStored<Debt[]>(STORAGE_KEYS.DEBTS, []);
        const idx = items.findIndex((d) => d.id === id);
        if (idx === -1) throw new Error('Debt not found');
        const updated = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
        items[idx] = updated;
        setStored(STORAGE_KEYS.DEBTS, items);
        return updated;
      }
    );
  },

  deleteDebt: async (id: string): Promise<void> => {
    return withFallback(
      () => debtService.deleteDebt(id),
      async () => {
        const items = getStored<Debt[]>(STORAGE_KEYS.DEBTS, []);
        setStored(STORAGE_KEYS.DEBTS, items.filter((d) => d.id !== id));
      }
    );
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
  ): Promise<{ debt: Debt; transaction?: Transaction | null; message: string }> => {
    return withFallback(
      () => debtService.repayDebt(id, payload),
      async () => {
        const items = getStored<Debt[]>(STORAGE_KEYS.DEBTS, []);
        const idx = items.findIndex((d) => d.id === id);
        if (idx === -1) throw new Error('Debt not found');
        const current = items[idx];
        const payment = Number(payload.repayAmount) || (current.amount - current.paidAmount);
        const newPaid = current.paidAmount + payment;
        const updatedDebt: Debt = {
          ...current,
          paidAmount: newPaid,
          status: newPaid >= current.amount ? 'settled' : 'partially_paid',
          updatedAt: new Date().toISOString(),
        };
        items[idx] = updatedDebt;
        setStored(STORAGE_KEYS.DEBTS, items);

        let newTx: Transaction | null = null;
        if (payload.logExpense !== false) {
          const txs = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
          newTx = {
            id: `tx_${Date.now()}`,
            amount: payment,
            type: 'expense',
            categoryId: payload.categoryId || 'cat_bills',
            date: payload.date || new Date().toISOString().split('T')[0],
            description: payload.description || `Debt Repayment to ${current.toWhom} (${current.title})`,
            paymentMethod: (payload.paymentMethod as any) || 'Bank Transfer',
            createdAt: new Date().toISOString(),
          };
          txs.unshift(newTx);
          setStored(STORAGE_KEYS.TRANSACTIONS, txs);
        }

        return {
          debt: updatedDebt,
          transaction: newTx,
          message: 'Repayment recorded successfully',
        };
      }
    );
  },


  // --- REPORTS ---
  getDailyReport: reportService.getDailyReport,
  getMonthlyReport: reportService.getMonthlyReport,
  getMonthlyComparison: reportService.getMonthlyComparison,

  // --- CONSISTENCY ---
  getConsistencyData: async (): Promise<ConsistencyDay[]> => {
    return withFallback(
      () => consistencyService.getConsistencyData(),
      async () => []
    );
  },

  // --- JOURNAL ---
  getJournalEntries: async (): Promise<JournalEntry[]> => {
    return withFallback(
      () => journalService.getJournalEntries(),
      async () => getStored<JournalEntry[]>(STORAGE_KEYS.JOURNAL, [])
    );
  },

  getJournalByDate: async (date: string): Promise<JournalEntry | undefined> => {
    return withFallback(
      () => journalService.getJournalByDate(date),
      async () => {
        const entries = getStored<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
        return entries.find((e) => e.date === date);
      }
    );
  },

  saveJournalEntry: async (
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> => {
    return withFallback(
      () => journalService.saveJournalEntry(entry),
      async () => {
        const entries = getStored<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
        const existingIdx = entries.findIndex((e) => e.date === entry.date);
        if (existingIdx !== -1) {
          const updated = { ...entries[existingIdx], ...entry, updatedAt: new Date().toISOString() };
          entries[existingIdx] = updated;
          setStored(STORAGE_KEYS.JOURNAL, entries);
          return updated;
        } else {
          const newEntry = { ...entry, id: `jrn_${Date.now()}`, createdAt: new Date().toISOString() };
          entries.unshift(newEntry as JournalEntry);
          setStored(STORAGE_KEYS.JOURNAL, entries);
          return newEntry as JournalEntry;
        }
      }
    );
  },

  // --- MEDIA ---
  uploadImage: mediaService.uploadImage,
  uploadAudio: mediaService.uploadAudio,

  getMemories: async (): Promise<MemoryItem[]> => {
    return withFallback(
      () => mediaService.getMemories(),
      async () => getStored<MemoryItem[]>(STORAGE_KEYS.MEMORIES, [])
    );
  },

  createMemory: async (item: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> => {
    return withFallback(
      () => mediaService.createMemory(item),
      async () => {
        const mems = getStored<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
        const newM = { ...item, id: `mem_${Date.now()}`, createdAt: new Date().toISOString() };
        mems.unshift(newM as MemoryItem);
        setStored(STORAGE_KEYS.MEMORIES, mems);
        return newM as MemoryItem;
      }
    );
  },

  toggleFavoriteMemory: async (id: string, isFavorite?: boolean): Promise<MemoryItem> => {
    return withFallback(
      () => mediaService.toggleFavoriteMemory(id, isFavorite),
      async () => {
        const mems = getStored<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
        const idx = mems.findIndex((m) => m.id === id);
        if (idx === -1) throw new Error('Memory not found');
        mems[idx].isFavorite = isFavorite !== undefined ? isFavorite : !mems[idx].isFavorite;
        setStored(STORAGE_KEYS.MEMORIES, mems);
        return mems[idx];
      }
    );
  },

  deleteMemory: async (id: string): Promise<void> => {
    return withFallback(
      () => mediaService.deleteMemory(id),
      async () => {
        const mems = getStored<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []);
        setStored(STORAGE_KEYS.MEMORIES, mems.filter((m) => m.id !== id));
      }
    );
  },

  // --- DASHBOARD ---
  getDashboard: dashboardService.getDashboardData,

  // --- DATA BACKUP & RESET ---
  exportAllData: async (): Promise<string> => {
    try {
      const [
        user,
        settings,
        tasks,
        taskCategories,
        goals,
        goalCategories,
        bucketItems,
        bucketCategories,
        transactions,
        financeCategories,
        journal,
        memories,
      ] = await Promise.all([
        api.getUser(),
        api.getSettings(),
        api.getTasks(),
        api.getTaskCategories(),
        api.getGoals(),
        api.getGoalCategories(),
        api.getBucketItems(),
        api.getBucketCategories(),
        api.getTransactions(),
        api.getFinanceCategories(),
        api.getJournalEntries(),
        api.getMemories(),
      ]);

      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user,
        settings,
        tasks,
        taskCategories,
        goals,
        goalCategories,
        bucketItems,
        bucketCategories,
        transactions,
        financeCategories,
        journal,
        memories,
      };
      return JSON.stringify(backup, null, 2);
    } catch {
      const data: Record<string, any> = {};
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        data[key] = getStored(storageKey, null);
      });
      return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), ...data }, null, 2);
    }
  },

  importAllData: async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.user) setStored(STORAGE_KEYS.USER, parsed.user);
      if (parsed.settings) setStored(STORAGE_KEYS.SETTINGS, parsed.settings);
      if (parsed.tasks) setStored(STORAGE_KEYS.TASKS, parsed.tasks);
      if (parsed.taskCategories) setStored(STORAGE_KEYS.TASK_CATEGORIES, parsed.taskCategories);
      if (parsed.goals) setStored(STORAGE_KEYS.GOALS, parsed.goals);
      if (parsed.goalCategories) setStored(STORAGE_KEYS.GOAL_CATEGORIES, parsed.goalCategories);
      if (parsed.bucketItems) setStored(STORAGE_KEYS.BUCKET_ITEMS, parsed.bucketItems);
      if (parsed.bucketCategories) setStored(STORAGE_KEYS.BUCKET_CATEGORIES, parsed.bucketCategories);
      if (parsed.transactions) setStored(STORAGE_KEYS.TRANSACTIONS, parsed.transactions);
      if (parsed.financeCategories) setStored(STORAGE_KEYS.FINANCE_CATEGORIES, parsed.financeCategories);
      if (parsed.journal) setStored(STORAGE_KEYS.JOURNAL, parsed.journal);
      if (parsed.memories) setStored(STORAGE_KEYS.MEMORIES, parsed.memories);

      return true;
    } catch {
      return false;
    }
  },

  resetToDefaults: async (): Promise<void> => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem('lifetrack_auth_token');
    } catch {
      // Ignore
    }
  },
};
