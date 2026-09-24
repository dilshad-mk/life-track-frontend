import React from 'react';
import { HandCoins, Calendar, ArrowDownRight, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { PendingFund } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatFriendlyDate } from '../../utils/dateUtils';

interface PendingFundCardProps {
  pendingFund: PendingFund;
  onEdit: (fund: PendingFund) => void;
  onReceive: (fund: PendingFund) => void;
  onDelete: (id: string) => void;
}

export const PendingFundCard: React.FC<PendingFundCardProps> = ({
  pendingFund,
  onEdit,
  onReceive,
  onDelete,
}) => {
  const { formatCurrency } = useApp();

  const remaining = Math.max(0, pendingFund.amount - pendingFund.receivedAmount);
  const progressPercent = Math.min(100, Math.round((pendingFund.receivedAmount / pendingFund.amount) * 100));
  const isFullyReceived = pendingFund.status === 'received' || remaining === 0;

  return (
    <div className="p-4 rounded-2xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/30 hover:border-sky-500/50 shadow-sm transition-all space-y-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <HandCoins className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {pendingFund.title}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-300">
                {pendingFund.category || 'Inflow'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              From: <strong className="text-slate-700 dark:text-slate-300">{pendingFund.fromWhom}</strong>
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right font-mono shrink-0">
          <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 block">
            {formatCurrency(pendingFund.amount)}
          </span>
          <span className="text-[10px] text-slate-400 font-sans block">
            {isFullyReceived ? 'Received Full' : `${formatCurrency(remaining)} pending`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          <span>Received: {formatCurrency(pendingFund.receivedAmount)}</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-sky-500/15 text-xs">
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-sky-500" />
          <span>Expected: {formatFriendlyDate(pendingFund.expectedDate)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isFullyReceived && (
            <button
              type="button"
              onClick={() => onReceive(pendingFund)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] shadow-sm shadow-sky-500/30 active:scale-95 transition-all"
              title="Transfer into Wallet Income"
            >
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              <span>Receive</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(pendingFund)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(pendingFund.id)}
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
