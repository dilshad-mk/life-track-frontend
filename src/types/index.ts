// ==========================================
// LifeTrack Core TypeScript Interfaces & Types
// ==========================================

export type Priority = 'low' | 'medium' | 'high';

export type TaskRecurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string; // Base64 data URL or remote URL
  name?: string;
  duration?: number; // In seconds for voice notes / videos
  createdAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string; // Tailwind color or hex
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId: string;
  date: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "09:30 AM"
  hasReminder?: boolean;
  reminderTime?: string;
  recurrence?: TaskRecurrence;
  notes?: string;
  attachments?: MediaAttachment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GoalCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  targetValue?: number;
}

export type Milestone = GoalMilestone;

export type GoalStatus = 'active' | 'completed' | 'on_hold';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  targetValue: number;
  currentValue: number;
  unit?: string; // e.g. '₹', 'hours', 'pages', '%'
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  status: GoalStatus;
  milestones: GoalMilestone[];
  notes?: string;
  attachments?: MediaAttachment[];
  isFinancial?: boolean; // Can sync with finance tracking
  createdAt: string;
  updatedAt: string;
}

export interface BucketCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type BucketStatus = 'planned' | 'in_progress' | 'completed';

export interface BucketItem {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  status: BucketStatus;
  priority: Priority;
  targetDate?: string;
  location?: string;
  estimatedCost?: number;
  notes?: string;
  attachments?: MediaAttachment[];
  completedAt?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isCustom?: boolean;
}

export type PaymentMethod = 'UPI / GPay' | 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  attachments?: MediaAttachment[];
  linkedGoalId?: string;
  createdAt: string;
}

export type PendingFundStatus = 'pending' | 'partially_received' | 'received';

export interface PendingFund {
  id: string;
  title: string;
  fromWhom: string; // Source / Client / Friend
  amount: number; // Total expected
  receivedAmount: number; // Already received
  expectedDate: string; // YYYY-MM-DD
  status: PendingFundStatus;
  notes?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DebtStatus = 'pending' | 'partially_paid' | 'settled';

export interface Debt {
  id: string;
  toWhom: string; // Lender / Creditor
  title: string; // Purpose / Reason
  amount: number; // Total debt amount
  paidAmount: number; // Amount repaid so far
  dueDate: string; // YYYY-MM-DD
  borrowedDate?: string; // YYYY-MM-DD
  status: DebtStatus;
  notes?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntry {

  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'low' | 'tough';
  achievements?: string[];
  attachments?: MediaAttachment[];
  createdAt: string;
  updatedAt: string;
}

// Memory Vault Item (Photos, Videos, Voice Notes, Favorites)
export interface MemoryItem {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  category: string; // e.g. 'Life', 'Travel', 'Achievement', 'Family'
  isFavorite: boolean;
  attachments: MediaAttachment[];
  createdAt: string;
}

export interface DailyReport {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  score: number; // 0-100
  totalExpense: number;
  totalIncome: number;
  isProductive: boolean; // based on user threshold
  journalSummary?: string;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  monthName: string;
  totalTasks: number;
  completedTasks: number;
  consistencyRate: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  goalsProgressed: number;
  bucketItemsCompleted: number;
}

export interface ConsistencyDay {
  date: string; // YYYY-MM-DD
  count: number; // completed tasks count
  total: number; // total tasks count
  percentage: number;
  isProductive: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  tagline?: string;
  streak?: {
    current: number;
    longest: number;
    lastActiveDate?: string;
  };

}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  theme: 'dark' | 'light' | 'system';
  productiveThresholdPercentage: number; // Default 70%
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  apiUrl: string;
  useMockData: boolean;
  language?: string;
  reminderTime?: string;
  startOfWeek?: number;
  biometricsEnabled?: boolean;
  autoBackup?: boolean;
}
