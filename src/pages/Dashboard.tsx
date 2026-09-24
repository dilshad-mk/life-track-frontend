import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Target,
  Wallet,
  Compass,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { ProgressUpdateModal } from '../components/goals/ProgressUpdateModal';
import { Goal } from '../types';
import { formatTime12Hour, formatFriendlyDate } from '../utils/dateUtils';
import { AdaptiveAmount } from '../components/common/AdaptiveAmount';

export const Dashboard: React.FC = () => {
  const {
    user,
    currentStreak,
    todayTasks,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionRate,
    todayRemainingCount,
    goals,
    bucketItems,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    totalSavingsBalance,
    totalPendingFunds,
    totalOutstandingDebt,
    formatCurrency,
    toggleTask,
    setActiveTab,
    openDrawer,
    selectedDate,
  } = useApp();



  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState<Goal | null>(null);

  // Motivational quote
  const quotes = [
    { text: "Consistency isn't about perfection. It's about simply showing up today.", author: "James Clear" },
    { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
    { text: "You don't have to be extreme, just consistent.", author: "Atomic Habits" },
  ];
  const quote = quotes[Math.abs(selectedDate.split('-').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % quotes.length];

  // Primary active goal
  const primaryGoal = goals.find((g) => g.status === 'active') || goals[0];
  const goalProgress = primaryGoal
    ? Math.min(100, Math.round((primaryGoal.currentValue / primaryGoal.targetValue) * 100))
    : 0;

  // Upcoming bucket list item
  const upcomingBucketItem = bucketItems.find((b) => b.status === 'in_progress') || bucketItems.find((b) => b.status === 'planned');

  const isDeficit = monthlySurplus < 0;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* 1. Today's Progress Card */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-slate-900/90 to-slate-900 border border-indigo-500/25 shadow-xl text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Today's Progress • {formatFriendlyDate(selectedDate)}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {todayCompletionRate}%
              </span>
              <span className="text-xs text-slate-300 font-medium">
                ({todayCompletedCount} / {todayTotalCount} completed)
              </span>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-slate-800"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-indigo-500 transition-all duration-700"
                strokeDasharray={`${todayCompletionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-indigo-300 font-mono">
              {todayCompletedCount}/{todayTotalCount}
            </span>
          </div>
        </div>

        {/* Progress Bar Visualizer */}
        <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${todayCompletionRate}%` }}
          />
        </div>

        {/* Consistency streak pill info */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{currentStreak} days streak</span>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-xs active:scale-95 transition-transform"
          >
            <span>Task Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Today's Quick Tasks */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Today's Tasks
            </h3>
            {todayRemainingCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                {todayRemainingCount} left
              </span>
            )}
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Task list with single tap */}
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-2 text-center">
              No tasks scheduled for today. Tap + to add one.
            </p>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer active:scale-98 ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/40 text-slate-400'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      task.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-400 dark:border-slate-500 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <span
                    className={`text-xs font-medium truncate ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100 font-semibold'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                {task.dueTime && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0 ml-2">
                    {formatTime12Hour(task.dueTime)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {todayTasks.length > 5 && (
          <button
            onClick={() => setActiveTab('tasks')}
            className="w-full text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
          >
            View all {todayTasks.length} tasks →
          </button>
        )}
      </div>

      {/* 3. Goal Spotlight Card */}
      {primaryGoal && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Goal Spotlight</span>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              All Goals →
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{primaryGoal.title}</h4>
            <div className="flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300 mt-1">
              <span>
                {primaryGoal.unit === '₹' ? formatCurrency(primaryGoal.currentValue) : `${primaryGoal.currentValue} ${primaryGoal.unit || ''}`}
                <span className="text-slate-400 font-normal">
                  {' '}/ {primaryGoal.unit === '₹' ? formatCurrency(primaryGoal.targetValue) : `${primaryGoal.targetValue} ${primaryGoal.unit || ''}`}
                </span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{goalProgress}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span>Deadline: {primaryGoal.targetDate}</span>
            <button
              onClick={() => setSelectedGoalForUpdate(primaryGoal)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 active:scale-95"
            >
              + Update Progress
            </button>
          </div>
        </div>
      )}

      {/* 4. Total Available Wealth & Financial Status */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-cyan-500" />
            <span>Available Wealth in Hand</span>
          </div>
          <button
            onClick={() => setActiveTab('finance')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Details →
          </button>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold font-sans block truncate mb-1">Available</span>
            <AdaptiveAmount
              value={formatCurrency(totalSavingsBalance)}
              mode="metric"
              className={totalSavingsBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold font-sans block truncate mb-1">Income</span>
            <AdaptiveAmount
              value={formatCurrency(monthlyIncome)}
              prefix="+"
              mode="metric"
              className="text-emerald-600 dark:text-emerald-400 font-bold"
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold font-sans block truncate mb-1">Expenses</span>
            <AdaptiveAmount
              value={formatCurrency(monthlyExpenses)}
              prefix="-"
              mode="metric"
              className="text-rose-600 dark:text-rose-400 font-bold"
            />
          </div>
        </div>

        {/* Monthly Surplus Bar */}
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
            monthlySurplus >= 0
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-300'
          }`}
        >
          <span className="font-medium shrink-0">
            {monthlySurplus >= 0 ? 'Monthly Net Surplus:' : 'Monthly Deficit Warning:'}
          </span>
          <div className="min-w-0 flex-1 ml-2 text-right">
            <AdaptiveAmount
              value={formatCurrency(monthlySurplus)}
              prefix={monthlySurplus >= 0 ? '+' : ''}
              mode="compact"
              className={`font-bold font-mono text-right ${
                monthlySurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            />
          </div>
        </div>

        {/* Expected Inflow (Sky Blue) & Debts Quick Badges */}
        {(totalPendingFunds > 0 || totalOutstandingDebt > 0) && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/25 text-left hover:bg-sky-500/15 transition-all flex items-center justify-between"
            >
              <span className="text-sky-600 dark:text-sky-400 font-bold truncate">
                💸 Not in Hand:
              </span>
              <span className="font-bold font-mono text-sky-700 dark:text-sky-300 ml-1">
                {formatCurrency(totalPendingFunds)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-left hover:bg-amber-500/15 transition-all flex items-center justify-between"
            >
              <span className="text-amber-700 dark:text-amber-400 font-bold truncate">
                ⚖️ Debts Owed:
              </span>
              <span className="font-bold font-mono text-rose-500 ml-1">
                {formatCurrency(totalOutstandingDebt)}
              </span>
            </button>
          </div>
        )}
      </div>


      {/* 5. Bucket List Preview */}
      {upcomingBucketItem && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-purple-500" />
              <span>Next Bucket Adventure</span>
            </div>
            <button
              onClick={() => setActiveTab('bucket')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Bucket List →
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {upcomingBucketItem.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {upcomingBucketItem.location || 'Life milestone'}
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300">
              {upcomingBucketItem.status === 'in_progress' ? 'In Progress' : 'Planned'}
            </span>
          </div>
        </div>
      )}

      {/* 6. Motivational Grounding Quote */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-center">
        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
          "{quote.text}"
        </p>
        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
          — {quote.author}
        </span>
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <ProgressUpdateModal
        isOpen={!!selectedGoalForUpdate}
        onClose={() => setSelectedGoalForUpdate(null)}
        goal={selectedGoalForUpdate}
      />
    </div>
  );
};
