import React from 'react';
import { Scale, Calendar, ArrowUpRight, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Debt } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatFriendlyDate, TODAY_IST } from '../../utils/dateUtils';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onRepay: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  onEdit,
  onRepay,
  onDelete,
}) => {
  const { formatCurrency } = useApp();

  const remaining = Math.max(0, debt.amount - debt.paidAmount);
  const progressPercent = Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100));
  const isSettled = debt.status === 'settled' || remaining === 0;
  const isOverdue = !isSettled && debt.dueDate < TODAY_IST;

  return (
    <div className={`p-4 rounded-2xl border shadow-sm transition-all space-y-3 ${
      isSettled
        ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-80'
        : isOverdue
        ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
        : 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
    }`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
            isSettled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 dark:text-emerald-400'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400'
          }`}>
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {debt.title}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                {debt.category || 'Debt'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Owed to: <strong className="text-slate-800 dark:text-slate-200">{debt.toWhom}</strong>
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right font-mono shrink-0">
          <span className="text-sm font-extrabold text-rose-500 dark:text-rose-400 block">
            {formatCurrency(debt.amount)}
          </span>
          <span className="text-[10px] text-slate-400 font-sans block">
            {isSettled ? 'Settled' : `${formatCurrency(remaining)} remaining`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isSettled ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span>Repaid: {formatCurrency(debt.paidAmount)}</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1 text-[11px]">
          {isOverdue ? (
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              Overdue: {formatFriendlyDate(debt.dueDate)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Due: {formatFriendlyDate(debt.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isSettled && (
            <button
              type="button"
              onClick={() => onRepay(debt)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm shadow-rose-600/30 active:scale-95 transition-all"
              title="Record Repayment"
            >
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              <span>Repay</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(debt)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(debt.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
