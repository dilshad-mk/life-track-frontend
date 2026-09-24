import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  AppSettings,
  Task,
  TaskCategory,
  Goal,
  GoalCategory,
  BucketItem,
  BucketCategory,
  Transaction,
  FinanceCategory,
  JournalEntry,
  ConsistencyDay,
  MemoryItem,
  PendingFund,
  Debt,
} from '../types';

import { api } from '../services/api';
import { getTodayIST, TODAY_IST, calculateStreaks } from '../utils/dateUtils';

import { notificationService, DueTaskSummary } from '../services/notificationService';

import { triggerHaptic } from '../utils/haptics';
import { getAuthToken } from '../services/apiClient';

export type NavTab = 'home' | 'tasks' | 'goals' | 'bucket' | 'finance';
export type DrawerType = 'planner' | 'reports' | 'settings' | 'categories' | 'qr' | 'memories' | null;

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation & Date
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeDrawer: DrawerType;
  openDrawer: (type: DrawerType) => void;
  closeDrawer: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  selectedDate: string; // YYYY-MM-DD in IST
  setSelectedDate: (date: string) => void;

  // Notifications
  dueTaskSummary: DueTaskSummary;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  testNotification: () => void;

  // Authentication & Session
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;

  // User & Settings
  user: User;
  settings: AppSettings;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  toggleTheme: () => void;

  // Tasks
  tasks: Task[];
  taskCategories: TaskCategory[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTaskCategory: (category: Omit<TaskCategory, 'id'>) => Promise<TaskCategory>;
  deleteTaskCategory: (id: string) => Promise<void>;

  // Goals
  goals: Goal[];
  goalCategories: GoalCategory[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
  updateGoalProgress: (id: string, currentValue: number) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalCategory: (category: Omit<GoalCategory, 'id'>) => Promise<GoalCategory>;

  // Bucket List
  bucketItems: BucketItem[];
  bucketCategories: BucketCategory[];
  addBucketItem: (item: Omit<BucketItem, 'id' | 'createdAt'>) => Promise<BucketItem>;
  updateBucketItem: (id: string, updates: Partial<BucketItem>) => Promise<BucketItem>;
  deleteBucketItem: (id: string) => Promise<void>;
  addBucketCategory: (category: Omit<BucketCategory, 'id'>) => Promise<BucketCategory>;

  // Finance
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  addFinanceCategory: (cat: Omit<FinanceCategory, 'id'>) => Promise<FinanceCategory>;

  // Pending Funds (Money Not in Hand / Expected Soon - Sky Blue)
  pendingFunds: PendingFund[];
  addPendingFund: (item: Omit<PendingFund, 'id' | 'createdAt' | 'updatedAt' | 'receivedAmount' | 'status'>) => Promise<PendingFund>;
  updatePendingFund: (id: string, updates: Partial<PendingFund>) => Promise<PendingFund>;
  deletePendingFund: (id: string) => Promise<void>;
  receivePendingFund: (
    id: string,
    payload: {
      receiveAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
    }
  ) => Promise<void>;

  // Debts & Liabilities (Money I Owe)
  debts: Debt[];
  addDebt: (item: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'status'>) => Promise<Debt>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<Debt>;
  deleteDebt: (id: string) => Promise<void>;
  repayDebt: (
    id: string,
    payload: {
      repayAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
      logExpense?: boolean;
    }
  ) => Promise<void>;


  // Memories Vault
  memories: MemoryItem[];
  addMemory: (item: Omit<MemoryItem, 'id' | 'createdAt'>) => Promise<MemoryItem>;
  toggleFavoriteMemory: (id: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Journal
  journalEntries: JournalEntry[];
  saveJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
  getJournalForDate: (date: string) => JournalEntry | undefined;

  // Consistency & Streak
  consistencyDays: ConsistencyDay[];
  currentStreak: number;
  longestStreak: number;

  // Computed Dashboard Metrics
  todayTasks: Task[];
  upcomingTasks: Task[];
  todayCompletedCount: number;
  todayTotalCount: number;
  todayCompletionRate: number;
  todayRemainingCount: number;

  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  totalSavingsBalance: number;
  totalPendingFunds: number;
  totalOutstandingDebt: number;
  overallGoalProgress: number;


  // Feedback & Utilities
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  celebrate: () => void;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  formatCompactCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_IST);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Navigation handlers
  const handleSetActiveTab = (tab: NavTab) => {
    setActiveTab(tab);
    setActiveDrawer(null); // Fix: Closes any active drawer page view (memories, reports, settings, planner)
    setIsMenuOpen(false); // Fix: Closes sidebar menu
  };

  const handleOpenDrawer = (type: DrawerType) => {
    setIsMenuOpen(false); // Fix: Closes sidebar menu when navigating to a view/modal
    setActiveDrawer(type);
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  // State slices
  const [user, setUser] = useState<User>({} as User);
  const [settings, setSettings] = useState<AppSettings>({} as AppSettings);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalCategories, setGoalCategories] = useState<GoalCategory[]>([]);
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [bucketCategories, setBucketCategories] = useState<BucketCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [consistencyDays, setConsistencyDays] = useState<ConsistencyDay[]>([]);
  const [pendingFunds, setPendingFunds] = useState<PendingFund[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAuthToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Toast notifier
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const celebrate = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }
  };

  // Reusable data fetcher
  const fetchAppData = async () => {
    try {
      setIsLoading(true);
      const [
        u,
        s,
        t,
        tc,
        g,
        gc,
        b,
        bc,
        tx,
        fc,
        mem,
        j,
        cd,
        pf,
        d,
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
        api.getMemories(),
        api.getJournalEntries(),
        api.getConsistencyData(),
        api.getPendingFunds(),
        api.getDebts(),
      ]);

      setUser(u);
      setSettings(s);
      setTasks(t);
      setTaskCategories(tc);
      setGoals(g);
      setGoalCategories(gc);
      setBucketItems(b);
      setBucketCategories(bc);
      setTransactions(tx);
      setFinanceCategories(fc);
      setMemories(mem);
      setJournalEntries(j);
      setConsistencyDays(cd);
      setPendingFunds(pf);
      setDebts(d);


      if (s.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-slate-100', 'text-slate-900');
        document.body.classList.add('bg-slate-950', 'text-slate-100');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-slate-950', 'text-slate-100');
        document.body.classList.add('bg-slate-100', 'text-slate-900');
      }
    } catch (err) {
      console.error('Failed to load app data', err);
      showToast('Error connecting to backend API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAppData();

    // Listen for unauthorized 401 events from apiClient
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('lifetrack:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lifetrack:unauthorized', handleUnauthorized);
  }, []);

  // Auth actions
  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${res.user.name}! 👋`);
    await fetchAppData();
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register(name, email, pass);
    setUser(res.user);
    setIsAuthenticated(true);
    showToast(`Account created! Welcome, ${res.user.name}! 🚀`);
    await fetchAppData();
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  };

  // Theme switcher
  const toggleTheme = async () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
    }
    const updated = await api.updateSettings({ theme: newTheme });
    setSettings(updated);
    showToast(`Switched to ${newTheme} mode`, 'info');
  };

  const updateUserHandler = async (updates: Partial<User>) => {
    const updated = await api.updateUser(updates);
    setUser(updated);
    showToast('Profile updated');
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    const updated = await api.updateAvatar(avatarUrl);
    setUser(updated);
    showToast('Profile photo updated 📸');
  };

  const updateSettingsHandler = async (updates: Partial<AppSettings>) => {
    const updated = await api.updateSettings(updates);
    setSettings(updated);
    showToast('Settings saved');
  };

  // --- Task Handlers ---
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createTask(task);
    setTasks((prev) => [created, ...prev]);
    showToast('Task added');
    return created;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    showToast('Task updated');
    return updated;
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    // Past date constraint: do not allow marking incomplete tasks as completed if date has passed
    if (!target.completed && target.date < TODAY_IST) {
      triggerHaptic('warning');
      showToast('Cannot complete tasks from past dates', 'error');
      return;
    }

    // Optimistic UI state
    const previousTasks = [...tasks];
    const isNowCompleted = !target.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: isNowCompleted,
              completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );

    if (isNowCompleted) {
      triggerHaptic('success');
      celebrate();
      showToast('Task completed! 🎉');
    } else {
      triggerHaptic('light');
    }

    try {
      const updated = await api.toggleTaskComplete(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      // Rollback on server error
      setTasks(previousTasks);
      triggerHaptic('warning');
      showToast('Could not save task on server. Rolled back.', 'error');
    }
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task removed', 'info');
  };

  const addTaskCategory = async (category: Omit<TaskCategory, 'id'>) => {
    const created = await api.createTaskCategory(category);
    setTaskCategories((prev) => [...prev, created]);
    showToast('Category created');
    return created;
  };

  const deleteTaskCategory = async (id: string) => {
    await api.deleteTaskCategory(id);
    setTaskCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category removed', 'info');
  };

  // --- Goal Handlers ---
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createGoal(goal);
    setGoals((prev) => [created, ...prev]);
    showToast('Goal created 🎯');
    return created;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updated = await api.updateGoal(id, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    showToast('Goal updated');
    return updated;
  };

  const updateGoalProgress = async (id: string, currentValue: number) => {
    const updated = await api.updateGoalProgress(id, currentValue);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    if (updated.status === 'completed') {
      celebrate();
      showToast('Goal accomplished! Incredible work! 🏆');
    } else {
      showToast('Progress updated');
    }
    return updated;
  };

  const deleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Goal removed', 'info');
  };

  const addGoalCategory = async (cat: Omit<GoalCategory, 'id'>) => {
    const created = await api.createGoalCategory(cat);
    setGoalCategories((prev) => [...prev, created]);
    showToast('Goal category created');
    return created;
  };

  // --- Bucket List Handlers ---
  const addBucketItem = async (item: Omit<BucketItem, 'id' | 'createdAt'>) => {
    const created = await api.createBucketItem(item);
    setBucketItems((prev) => [created, ...prev]);
    showToast('Added to Bucket List ✨');
    return created;
  };

  const updateBucketItem = async (id: string, updates: Partial<BucketItem>) => {
    const updated = await api.updateBucketItem(id, updates);
    setBucketItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    if (updates.status === 'completed') {
      celebrate();
      showToast('Bucket list experience checked off! 🌟');
    } else {
      showToast('Bucket item updated');
    }
    return updated;
  };

  const deleteBucketItem = async (id: string) => {
    await api.deleteBucketItem(id);
    setBucketItems((prev) => prev.filter((b) => b.id !== id));
    showToast('Item deleted', 'info');
  };

  const addBucketCategory = async (cat: Omit<BucketCategory, 'id'>) => {
    const created = await api.createBucketCategory(cat);
    setBucketCategories((prev) => [...prev, created]);
    showToast('Bucket category created');
    return created;
  };

  // --- Finance Handlers ---
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const created = await api.createTransaction(tx);
    setTransactions((prev) => [created, ...prev]);
    showToast(tx.type === 'income' ? 'Income logged 💰' : 'Expense recorded 🧾');
    // If linked to goal, re-fetch goals to show updated value
    if (tx.linkedGoalId) {
      const g = await api.getGoals();
      setGoals(g);
    }
    return created;
  };

  const deleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'info');
  };

  const addFinanceCategory = async (cat: Omit<FinanceCategory, 'id'>) => {
    const created = await api.createFinanceCategory(cat);
    setFinanceCategories((prev) => [...prev, created]);
    showToast('Finance category created');
    return created;
  };

  // --- Pending Funds (Money Not in Hand / Expected Inflow - Sky Blue) ---
  const addPendingFund = async (item: Omit<PendingFund, 'id' | 'createdAt' | 'updatedAt' | 'receivedAmount' | 'status'>) => {
    const created = await api.createPendingFund(item);
    setPendingFunds((prev) => [created, ...prev]);
    showToast('Expected inflow added (Money not in hand) 💸');
    return created;
  };

  const updatePendingFund = async (id: string, updates: Partial<PendingFund>) => {
    const updated = await api.updatePendingFund(id, updates);
    setPendingFunds((prev) => prev.map((p) => (p.id === id ? updated : p)));
    showToast('Expected fund updated');
    return updated;
  };

  const deletePendingFund = async (id: string) => {
    await api.deletePendingFund(id);
    setPendingFunds((prev) => prev.filter((p) => p.id !== id));
    showToast('Pending fund removed', 'info');
  };

  const receivePendingFund = async (
    id: string,
    payload: {
      receiveAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
    }
  ) => {
    const res = await api.receivePendingFund(id, payload);
    setPendingFunds((prev) => prev.map((p) => (p.id === id ? res.pendingFund : p)));
    setTransactions((prev) => [res.transaction, ...prev]);
    celebrate();
    showToast(`Transferred ${formatCurrency(res.transaction.amount)} to available income! 💰`);
  };

  // --- Debts & Liabilities (Money I Owe) ---
  const addDebt = async (item: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'status'>) => {
    const created = await api.createDebt(item);
    setDebts((prev) => [created, ...prev]);
    showToast('Debt record created 📋');
    return created;
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    const updated = await api.updateDebt(id, updates);
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
    showToast('Debt record updated');
    return updated;
  };

  const deleteDebt = async (id: string) => {
    await api.deleteDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
    showToast('Debt record removed', 'info');
  };

  const repayDebt = async (
    id: string,
    payload: {
      repayAmount?: number;
      date?: string;
      categoryId?: string;
      paymentMethod?: string;
      description?: string;
      logExpense?: boolean;
    }
  ) => {
    const res = await api.repayDebt(id, payload);
    setDebts((prev) => prev.map((d) => (d.id === id ? res.debt : d)));
    if (res.transaction) {
      setTransactions((prev) => [res.transaction!, ...prev]);
    }
    if (res.debt.status === 'settled') {
      celebrate();
      showToast('Debt completely settled! Incredible work! 🎉');
    } else {
      showToast('Repayment recorded & balance reduced 👍');
    }
  };


  // --- Memories Vault Handlers ---
  const addMemory = async (item: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    const created = await api.createMemory(item);
    setMemories((prev) => [created, ...prev]);
    showToast('Memory saved to vault 🌟');
    return created;
  };

  const toggleFavoriteMemory = async (id: string) => {
    const updated = await api.toggleFavoriteMemory(id);
    setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(updated.isFavorite ? 'Marked as Favorite ⭐' : 'Removed from Favorites');
  };

  const deleteMemory = async (id: string) => {
    await api.deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    showToast('Memory deleted', 'info');
  };

  // --- Journal Handlers ---
  const saveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const saved = await api.saveJournalEntry(entry);
    setJournalEntries((prev) => {
      const exists = prev.findIndex((j) => j.date === entry.date);
      if (exists !== -1) {
        const copy = [...prev];
        copy[exists] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    showToast('Journal saved ✍️');
    return saved;
  };

  const getJournalForDate = (date: string) => {
    return journalEntries.find((j) => j.date === date);
  };

  // --- Computed Metrics ---
  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  const upcomingTasks = tasks.filter((t) => t.date > TODAY_IST);
  const todayCompletedCount = todayTasks.filter((t) => t.completed).length;
  const todayTotalCount = todayTasks.length;
  const todayCompletionRate = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;
  const todayRemainingCount = Math.max(0, todayTotalCount - todayCompletedCount);


  // Real-time dynamic streak calculation from tasks
  const { currentStreak, longestStreak } = calculateStreaks(tasks);
  const effectiveUser: User = {
    ...user,
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
  };


  // Financial calculations for current month

  const currentMonthStr = TODAY_IST.substring(0, 7);
  const monthlyTx = transactions.filter((t) => t.date.startsWith(currentMonthStr));
  const monthlyIncome = monthlyTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  // Total savings / wealth in hand = total income - total expenses from real transactions
  const allTimeIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const allTimeExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavingsBalance = allTimeIncome - allTimeExpenses;

  // Pending funds (Money Not in Hand - Sky Blue) total
  const totalPendingFunds = pendingFunds
    .filter((p) => p.status !== 'received')
    .reduce((sum, p) => sum + Math.max(0, p.amount - p.receivedAmount), 0);

  // Debts & Liabilities (Money I Owe) total
  const totalOutstandingDebt = debts
    .filter((d) => d.status !== 'settled')
    .reduce((sum, d) => sum + Math.max(0, d.amount - d.paidAmount), 0);


  // Goals progress
  const activeGoals = goals.filter((g) => g.status === 'active');
  const overallGoalProgress = activeGoals.length > 0
    ? Math.round(
        activeGoals.reduce((acc, g) => acc + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) /
          activeGoals.length
      )
    : 0;

  // Format currency helpers
  const formatCurrency = (amount: number) => {
    const symbol = settings.currencySymbol || '₹';
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toLocaleString('en-IN');
    return `${isNegative ? '-' : ''}${symbol}${absVal}`;
  };

  const formatCompactCurrency = (amount: number) => {
    const symbol = settings.currencySymbol || '₹';
    const isNegative = amount < 0;
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 10000) {
      return `${isNegative ? '-' : ''}${symbol}${(abs / 1000).toFixed(1)}k`;
    }
    return `${isNegative ? '-' : ''}${symbol}${abs.toLocaleString('en-IN')}`;
  };

  // Due task notifications & alerts
  const dueTaskSummary = notificationService.checkPendingTasks(tasks);

  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      notificationService.triggerTaskAlertIfDue(tasks, settings.notificationsEnabled ?? true);
    }
  }, [tasks, isLoading, settings.notificationsEnabled]);

  const requestNotificationPermission = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      showToast('Notifications enabled! 🔔');
      notificationService.sendNotification(
        'LifeTrack Reminders Active',
        'You will receive notifications for tasks due soon or nearing day end.'
      );
    } else if (perm === 'denied') {
      showToast('Notifications blocked in browser permissions', 'error');
    }
    return perm;
  };

  const testNotification = () => {
    const sent = notificationService.sendNotification(
      'LifeTrack Task Alert ⏳',
      'Test notification: Reminder to complete your daily tasks before the date ends!'
    );
    if (!sent) {
      showToast('Please enable notifications first via browser permissions', 'info');
    } else {
      showToast('Notification triggered! 🔔');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab: handleSetActiveTab,
        activeDrawer,
        openDrawer: handleOpenDrawer,
        closeDrawer: handleCloseDrawer,
        isMenuOpen,
        openMenu,
        closeMenu,
        dueTaskSummary,
        requestNotificationPermission,
        testNotification,
        selectedDate,
        setSelectedDate,
        isAuthenticated,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        user: effectiveUser,
        currentStreak,
        longestStreak,
        settings,
        updateUser: updateUserHandler,

        updateUserAvatar,
        updateSettings: updateSettingsHandler,
        toggleTheme,
        tasks,
        taskCategories,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addTaskCategory,
        deleteTaskCategory,
        goals,
        goalCategories,
        addGoal,
        updateGoal,
        updateGoalProgress,
        deleteGoal,
        addGoalCategory,
        bucketItems,
        bucketCategories,
        addBucketItem,
        updateBucketItem,
        deleteBucketItem,
        addBucketCategory,
        transactions,
        financeCategories,
        addTransaction,
        deleteTransaction,
        addFinanceCategory,
        pendingFunds,
        addPendingFund,
        updatePendingFund,
        deletePendingFund,
        receivePendingFund,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        repayDebt,
        memories,

        addMemory,
        toggleFavoriteMemory,
        deleteMemory,
        journalEntries,
        saveJournalEntry,
        getJournalForDate,
        consistencyDays,
        todayTasks,
        upcomingTasks,
        todayCompletedCount,
        todayTotalCount,
        todayCompletionRate,
        todayRemainingCount,
        monthlyIncome,
        monthlyExpenses,
        monthlySurplus,
        totalSavingsBalance,
        totalPendingFunds,
        totalOutstandingDebt,
        overallGoalProgress,

        toasts,
        showToast,
        removeToast,
        celebrate,
        isLoading,
        formatCurrency,
        formatCompactCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
