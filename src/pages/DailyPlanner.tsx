import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  BookOpen,
  Wallet,
  Award,
  Sparkles,
  Plus,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HorizontalDatePicker } from '../components/tasks/HorizontalDatePicker';
import { JournalFormModal } from '../components/journal/JournalFormModal';
import { JournalEntryCard } from '../components/journal/JournalEntryCard';
import { EmptyState } from '../components/common/EmptyState';
import { formatFriendlyDate, formatTime12Hour, TODAY_IST } from '../utils/dateUtils';
import { AdaptiveAmount } from '../components/common/AdaptiveAmount';

export const DailyPlannerPage: React.FC = () => {
  const {
    tasks,
    transactions,
    selectedDate,
    getJournalForDate,
    toggleTask,
    formatCurrency,
    closeDrawer,
    settings,
  } = useApp();

  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

  // Daily Tasks
  const dateTasks = tasks.filter((t) => t.date === selectedDate);
  const completedTasks = dateTasks.filter((t) => t.completed);
  const incompleteTasks = dateTasks.filter((t) => !t.completed);

  // Daily Score = (completed / total) * 100
  const dailyScore = dateTasks.length > 0 ? Math.round((completedTasks.length / dateTasks.length) * 100) : 0;
  const isProductive = dailyScore >= (settings.productiveThresholdPercentage || 70);

  // Daily Expenses
  const dailyExpenses = transactions
    .filter((t) => t.date === selectedDate && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Daily Journal
  const journal = getJournalForDate(selectedDate);

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeDrawer}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
          {formatFriendlyDate(selectedDate)}
        </span>
      </div>

      {/* Date Picker Bar */}
      <HorizontalDatePicker />

      {/* 1. Daily Score & Productivity Overview Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900 border border-indigo-500/25 shadow-xl space-y-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Daily Productivity Score
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
              {dailyScore}%
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 ${
              isProductive
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>{isProductive ? 'Productive Day 🚀' : 'Building Momentum ⚡'}</span>
          </div>
        </div>

        {/* 3 Metrics: Completed, Remaining, Expenses */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
          <div className="p-2 rounded-xl bg-slate-800/40 min-w-0 overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Done</span>
            <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">
              {completedTasks.length} tasks
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/40 min-w-0 overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Pending</span>
            <div className="text-xs font-bold text-slate-300 mt-0.5 truncate">
              {incompleteTasks.length} tasks
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/40 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans mb-0.5">Spent Today</span>
            <AdaptiveAmount
              value={formatCurrency(dailyExpenses)}
              mode="metric"
              className="text-rose-400 font-bold"
            />
          </div>
        </div>
      </div>

      {/* 2. Tasks for this date */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Daily Tasks ({dateTasks.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {completedTasks.length} / {dateTasks.length} completed
          </span>
        </div>

        <div className="space-y-2">
          {dateTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-2 text-center">
              No tasks scheduled for this day.
            </p>
          ) : (
            dateTasks.map((t) => {
              const isPastMissed = selectedDate < TODAY_IST && !t.completed;

              return (
                <div
                  key={t.id}
                  onClick={() => !isPastMissed && toggleTask(t.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    t.completed
                      ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 text-slate-400'
                      : isPastMissed
                      ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/40 text-slate-500'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-50 cursor-pointer active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      disabled={isPastMissed}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        t.completed
                          ? 'bg-emerald-500 text-white'
                          : isPastMissed
                          ? 'border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-rose-500 cursor-not-allowed'
                          : 'border-2 border-slate-400 hover:border-indigo-500'
                      }`}
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isPastMissed ? (
                        <span className="text-[9px] font-bold">✕</span>
                      ) : null}
                    </button>
                    <span
                      className={`text-xs font-medium truncate ${
                        t.completed
                          ? 'line-through text-slate-400'
                          : isPastMissed
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100 font-semibold'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isPastMissed && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        Missed
                      </span>
                    )}
                    {t.dueTime && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTime12Hour(t.dueTime)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Daily Reflection / Journal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Daily Journal & Note</span>
          </div>
          <button
            onClick={() => setIsJournalModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{journal ? 'Edit Journal' : 'Write Journal'}</span>
          </button>
        </div>

        {journal ? (
          <JournalEntryCard entry={journal} onEdit={() => setIsJournalModalOpen(true)} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No journal entry for this date"
            description="Take 60 seconds to record your thoughts, mood, wins, or voice recording."
            actionLabel="Write Journal Note"
            onAction={() => setIsJournalModalOpen(true)}
          />
        )}
      </div>

      {/* Journal Modal */}
      <JournalFormModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        date={selectedDate}
      />
    </div>
  );
};
