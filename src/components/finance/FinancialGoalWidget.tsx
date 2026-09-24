import React from 'react';
import { Target, TrendingUp, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinancialGoalWidget: React.FC<{ onOpenGoalModal?: () => void }> = ({
  onOpenGoalModal,
}) => {
  const { goals, formatCurrency } = useApp();

  // Find primary financial goal
  const financialGoal = goals.find((g) => g.isFinancial || g.unit === '₹');

  if (!financialGoal) return null;

  const target = financialGoal.targetValue;
  const current = financialGoal.currentValue;
  const remaining = Math.max(0, target - current);
  const progressPercent = Math.min(100, Math.round((current / target) * 100));

  // Calculate required monthly saving based on target date
  const calculateRequiredMonthly = () => {
    try {
      const today = new Date();
      const targetDate = new Date(financialGoal.targetDate + 'T12:00:00');
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.max(1, Math.round(diffDays / 30));

      if (remaining <= 0) return 0;
      return Math.round(remaining / monthsRemaining);
    } catch {
      return Math.round(remaining / 3);
    }
  };

  const monthlyRequired = calculateRequiredMonthly();

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/60 via-white dark:via-slate-900/80 to-white dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/25 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Linked Financial Goal
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{financialGoal.title}</p>
          </div>
        </div>

        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
          {progressPercent}%
        </span>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-center font-mono">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Target</span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {formatCurrency(target)}
          </div>
        </div>

        <div className="border-x border-slate-200 dark:border-slate-700/50">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Saved</span>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(current)}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Remaining</span>
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Required Monthly Saving Alert Banner */}
      {remaining > 0 && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="text-[11px]">
              Required saving: <strong>{formatCurrency(monthlyRequired)}/month</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            due {financialGoal.targetDate}
          </span>
        </div>
      )}
    </div>
  );
};
