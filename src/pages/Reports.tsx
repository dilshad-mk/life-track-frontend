import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Wallet,
  Compass,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { BarTrendChart } from '../components/charts/BarTrendChart';
import { AdaptiveAmount } from '../components/common/AdaptiveAmount';

export const ReportsPage: React.FC = () => {
  const {
    user,
    currentStreak,
    longestStreak,
    tasks,
    transactions,
    goals,
    bucketItems,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    formatCurrency,
    closeDrawer,
  } = useApp();


  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Completed & Missed tasks stats
  const totalTasksAllTime = tasks.length;
  const completedTasksAllTime = tasks.filter((t) => t.completed).length;
  const missedTasksAllTime = tasks.filter((t) => !t.completed).length;
  const allTimeCompletionRate = totalTasksAllTime > 0 ? Math.round((completedTasksAllTime / totalTasksAllTime) * 100) : 0;

  // Bucket list completed
  const completedBucketCount = bucketItems.filter((b) => b.status === 'completed').length;
  const totalBucketCount = bucketItems.length;

  // Dynamic Real Monthly Progress Calculation
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthName = now.toLocaleDateString('en-IN', { month: 'short' });
  const prevMonthName = prevDate.toLocaleDateString('en-IN', { month: 'short' });

  // Tasks
  const curTasks = tasks.filter((t) => (t.date || '').startsWith(currentMonthStr));
  const prevTasks = tasks.filter((t) => (t.date || '').startsWith(prevMonthStr));
  const curTasksDone = curTasks.filter((t) => t.completed).length;
  const prevTasksDone = prevTasks.filter((t) => t.completed).length;
  const tasksDelta = curTasksDone - prevTasksDone;

  const curRate = curTasks.length > 0 ? Math.round((curTasksDone / curTasks.length) * 100) : 0;
  const prevRate = prevTasks.length > 0 ? Math.round((prevTasksDone / prevTasks.length) * 100) : 0;
  const rateDelta = curRate - prevRate;

  // Transactions
  const curTx = transactions.filter((t) => (t.date || '').startsWith(currentMonthStr));
  const prevTx = transactions.filter((t) => (t.date || '').startsWith(prevMonthStr));

  const curIncome = curTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const incomeDelta = curIncome - prevIncome;

  const curExpense = curTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const expenseDelta = curExpense - prevExpense;

  const curSurplus = curIncome - curExpense;
  const prevSurplus = prevIncome - prevExpense;
  const surplusDelta = curSurplus - prevSurplus;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Header with back */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeDrawer}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reports & Analytics</span>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              timeframe === tf
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* 1. Monthly Comparison Delta Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Monthly Progress Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentMonthName} vs {prevMonthName} Delta
            </p>
          </div>
          <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
            rateDelta >= 0
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
              : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
          }`}>
            {rateDelta >= 0 ? `+${rateDelta}%` : `${rateDelta}%`} Rate
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Tasks Completed */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Tasks Completed</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400 line-through">{prevTasksDone}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 font-bold">{curTasksDone}</span>
              <span className={`font-semibold flex items-center text-[11px] ${
                tasksDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {tasksDelta >= 0 ? `+${tasksDelta}` : `${tasksDelta}`}{' '}
                {tasksDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Consistency Rate */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Consistency Rate</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400 line-through">{prevRate}%</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-100 font-bold">{curRate}%</span>
              <span className={`font-semibold flex items-center text-[11px] ${
                rateDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {rateDelta >= 0 ? `+${rateDelta}%` : `${rateDelta}%`}{' '}
                {rateDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 gap-2">
            <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Monthly Income</span>
            <div className="flex items-center gap-1.5 font-mono flex-wrap justify-end">
              <span className="text-slate-400 line-through text-[11px]">{formatCurrency(prevIncome)}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <div className="min-w-0 max-w-[90px]">
                <AdaptiveAmount
                  value={formatCurrency(curIncome)}
                  mode="compact"
                  className="text-emerald-600 dark:text-emerald-400 font-bold"
                />
              </div>
              <span className={`font-semibold flex items-center text-[10px] shrink-0 ${
                incomeDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {incomeDelta >= 0 ? `+${formatCurrency(incomeDelta)}` : `-${formatCurrency(Math.abs(incomeDelta))}`}
              </span>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 gap-2">
            <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">Expenses</span>
            <div className="flex items-center gap-1.5 font-mono flex-wrap justify-end">
              <span className="text-slate-400 line-through text-[11px]">{formatCurrency(prevExpense)}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <div className="min-w-0 max-w-[90px]">
                <AdaptiveAmount
                  value={formatCurrency(curExpense)}
                  mode="compact"
                  className="text-slate-900 dark:text-slate-200 font-bold"
                />
              </div>
              <span className={`font-semibold flex items-center text-[10px] shrink-0 ${
                expenseDelta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {expenseDelta <= 0 ? `-${formatCurrency(Math.abs(expenseDelta))}` : `+${formatCurrency(expenseDelta)}`}{' '}
                {expenseDelta <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Net Savings */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 gap-2">
            <span className="text-indigo-800 dark:text-indigo-300 font-bold shrink-0">Net Surplus / Profit</span>
            <div className="flex items-center gap-1.5 font-mono flex-wrap justify-end">
              <span className="text-slate-400 line-through text-[11px]">{formatCurrency(prevSurplus)}</span>
              <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
              <div className="min-w-0 max-w-[90px]">
                <AdaptiveAmount
                  value={formatCurrency(curSurplus)}
                  mode="compact"
                  className="text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm"
                />
              </div>
              <span className={`font-bold flex items-center text-xs shrink-0 ${
                surplusDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {surplusDelta >= 0 ? `+${formatCurrency(surplusDelta)}` : `-${formatCurrency(Math.abs(surplusDelta))}`}{' '}
                {surplusDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Streak & Habit Consistency KPI Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Consistency & Streak Analytics</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase font-semibold">Current Streak</span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{currentStreak} Days</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase font-semibold">Best Streak</span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              {longestStreak} Days
            </div>
          </div>
        </div>


        {/* Heatmap */}
        <CalendarHeatmap />
      </div>

      {/* 3. Monthly Financial Chart Comparison */}
      <BarTrendChart />

      {/* 4. Bucket List Completion Metric */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/25 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Bucket List Completion</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {completedBucketCount} of {totalBucketCount} life experiences fulfilled
            </p>
          </div>
        </div>

        <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-500/20">
          {totalBucketCount > 0 ? Math.round((completedBucketCount / totalBucketCount) * 100) : 0}%
        </span>
      </div>
    </div>
  );
};
