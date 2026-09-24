import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, DollarSign, Calendar, CreditCard, Tag, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Debt, PaymentMethod } from '../../types';
import { TODAY_IST } from '../../utils/dateUtils';

interface RepayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'UPI / GPay',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Other',
];

export const RepayDebtModal: React.FC<RepayDebtModalProps> = ({
  isOpen,
  onClose,
  debt,
}) => {
  const { repayDebt, financeCategories, formatCurrency, settings } = useApp();

  const [repayAmount, setRepayAmount] = useState('');
  const [date, setDate] = useState(TODAY_IST);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [logExpense, setLogExpense] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense categories
  const expenseCategories = financeCategories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (debt) {
      const remaining = Math.max(0, debt.amount - debt.paidAmount);
      setRepayAmount(String(remaining));
      setDate(TODAY_IST);
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      }
      setLogExpense(true);
    }
  }, [debt, isOpen, financeCategories]);

  if (!isOpen || !debt) return null;

  const remaining = Math.max(0, debt.amount - debt.paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) return;

    try {
      setIsSubmitting(true);
      await repayDebt(debt.id, {
        repayAmount: amt,
        date,
        categoryId: categoryId || (expenseCategories[0]?.id || 'cat_bills'),
        paymentMethod,
        description: `Repaid debt to ${debt.toWhom} (${debt.title})`,
        logExpense,
      });
      onClose();
    } catch (err) {
      console.error('Error recording debt repayment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600/20 via-amber-500/10 to-transparent border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Repay Debt
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Reduces remaining debt balance & logs repayment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Debt Summary Banner */}
        <div className="mx-5 mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Lender / Creditor</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{debt.toWhom}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{debt.title}</p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase block">Remaining Due</span>
            <span className="text-sm font-bold text-rose-500 dark:text-rose-400">{formatCurrency(remaining)}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount to repay */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Repayment Amount ({settings.currencySymbol || '₹'}) *
              </label>
              <button
                type="button"
                onClick={() => setRepayAmount(String(remaining))}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Pay Full ({formatCurrency(remaining)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-rose-600 dark:text-rose-400 text-lg">
                {settings.currencySymbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                required
                max={remaining}
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/30 rounded-2xl text-xl font-bold font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payment Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Paid Via
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Toggle Log as Expense */}
          <div
            onClick={() => setLogExpense(!logExpense)}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {logExpense ? (
                <CheckSquare className="w-5 h-5 text-rose-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Log as Wallet Expense
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Deducts from available funds in hand
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-500">
              {logExpense ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
