import { 
  User, 
  Task, 
  TaskCategory, 
  Goal, 
  GoalCategory, 
  BucketItem, 
  BucketCategory, 
  Transaction, 
  FinanceCategory, 
  JournalEntry, 
  AppSettings,
  ConsistencyDay,
  MemoryItem,
} from '../types';

export const INITIAL_USER: User = {
  id: 'usr_01',
  name: 'User',
  email: '',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  bio: 'Building habits, tracking wealth, living intentionally 🚀',
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: '',
  },
};

export const INITIAL_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  theme: 'dark',
  productiveThresholdPercentage: 70,
  notificationsEnabled: true,
  hapticFeedback: true,
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'https://life-track-wy17.onrender.com/api',
  useMockData: false,
};

export const INITIAL_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'cat_study', name: 'Study', color: '#6366f1', icon: 'BookOpen' },
  { id: 'cat_work', name: 'Work', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'cat_personal', name: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'cat_health', name: 'Health', color: '#10b981', icon: 'Activity' },
  { id: 'cat_finance', name: 'Finance', color: '#f59e0b', icon: 'Wallet' },
  { id: 'cat_other', name: 'Other', color: '#8b5cf6', icon: 'Tag' },
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_GOAL_CATEGORIES: GoalCategory[] = [
  { id: 'gcat_finance', name: 'Financial Freedom', color: '#10b981', icon: 'DollarSign' },
  { id: 'gcat_health', name: 'Fitness & Vitality', color: '#ef4444', icon: 'Activity' },
  { id: 'gcat_learning', name: 'Skills & Learning', color: '#3b82f6', icon: 'BookOpen' },
  { id: 'gcat_career', name: 'Career & Work', color: '#8b5cf6', icon: 'Briefcase' },
];

export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_BUCKET_CATEGORIES: BucketCategory[] = [
  { id: 'bcat_travel', name: 'Travel & Exploration', color: '#3b82f6', icon: 'MapPin' },
  { id: 'bcat_adventure', name: 'High Adventure', color: '#f97316', icon: 'Compass' },
  { id: 'bcat_skills', name: 'Mastery & Hobbies', color: '#8b5cf6', icon: 'Award' },
];

export const INITIAL_BUCKET_ITEMS: BucketItem[] = [];

export const INITIAL_FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 'fc_salary', name: 'Salary & Income', type: 'income', color: '#10b981', icon: 'Briefcase' },
  { id: 'fc_investment', name: 'Investments & Dividends', type: 'income', color: '#06b6d4', icon: 'TrendingUp' },
  { id: 'fc_food', name: 'Dining & Groceries', type: 'expense', color: '#f59e0b', icon: 'Utensils' },
  { id: 'fc_housing', name: 'Rent & Utilities', type: 'expense', color: '#ec4899', icon: 'Home' },
  { id: 'fc_transport', name: 'Transport & Fuel', type: 'expense', color: '#3b82f6', icon: 'Car' },
  { id: 'fc_leisure', name: 'Entertainment & Fun', type: 'expense', color: '#8b5cf6', icon: 'Film' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];

export const INITIAL_MEMORIES: MemoryItem[] = [];

export const INITIAL_CONSISTENCY_DAYS: ConsistencyDay[] = [];
