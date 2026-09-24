import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';
import { Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { AdaptiveAmount, AdaptiveText } from '../common/AdaptiveAmount';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onDelete,
}) => {
  const { financeCategories, formatCurrency } = useApp();

  const isIncome = transaction.type === 'income';
  const category = financeCategories.find((c) => c.id === transaction.categoryId);

  const photoAttachment = transaction.attachments?.find((a) => a.type === 'image');
  const voiceAttachment = transaction.attachments?.find((a) => a.type === 'audio');

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-sm group">
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
            isIncome
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400'
          }`}
        >
          {isIncome ? (
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <AdaptiveText
              value={transaction.description}
              mode="title"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {category && (
              <span
                className="font-medium px-1.5 py-0.2 rounded-md border text-[10px]"
                style={{
                  backgroundColor: `${category.color}15`,
                  borderColor: `${category.color}35`,
                  color: category.color,
                }}
              >
                {category.name}
              </span>
            )}
            <span className="font-mono text-slate-500 dark:text-slate-400">{transaction.paymentMethod}</span>
            <span>•</span>
            <span className="font-mono">{transaction.date}</span>
          </div>

          {/* Attachments preview */}
          {(photoAttachment || voiceAttachment) && (
            <div className="flex items-center gap-2 mt-1.5">
              {photoAttachment && (
                <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  <ImageIcon className="w-3 h-3" />
                  <span>Receipt</span>
                </span>
              )}
              {voiceAttachment && (
                <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                  <Mic className="w-3 h-3" />
                  <span>Voice Note</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Amount & Delete Button */}
      <div className="flex items-center gap-2 shrink-0 max-w-[45%]">
        <div className="text-right min-w-0 flex-1">
          <AdaptiveAmount
            value={formatCurrency(transaction.amount)}
            prefix={isIncome ? '+' : '-'}
            mode="compact"
            className={`font-bold font-mono text-right tabular-nums ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Delete transaction"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
