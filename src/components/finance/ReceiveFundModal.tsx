import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, DollarSign, Calendar, CreditCard, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PendingFund, PaymentMethod } from '../../types';
import { TODAY_IST } from '../../utils/dateUtils';

interface ReceiveFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFund: PendingFund | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'UPI / GPay',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Other',
];

export const ReceiveFundModal: React.FC<ReceiveFundModalProps> = ({
  isOpen,
  onClose,
  pendingFund,
}) => {
  const { receivePendingFund, financeCategories, formatCurrency, settings } = useApp();

  const [receiveAmount, setReceiveAmount] = useState('');
  const [date, setDate] = useState(TODAY_IST);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Income categories only
  const incomeCategories = financeCategories.filter((c) => c.type === 'income');

  useEffect(() => {
    if (pendingFund) {
      const remaining = Math.max(0, pendingFund.amount - pendingFund.receivedAmount);
      setReceiveAmount(String(remaining));
      setDate(TODAY_IST);
      if (incomeCategories.length > 0) {
        setCategoryId(incomeCategories[0].id);
      }
    }
  }, [pendingFund, isOpen, financeCategories]);

  if (!isOpen || !pendingFund) return null;

  const remaining = Math.max(0, pendingFund.amount - pendingFund.receivedAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(receiveAmount);
    if (!amt || amt <= 0) return;

    try {
      setIsSubmitting(true);
      await receivePendingFund(pendingFund.id, {
        receiveAmount: amt,
        date,
        categoryId: categoryId || (incomeCategories[0]?.id || 'cat_salary'),
        paymentMethod,
        description: `Received from ${pendingFund.fromWhom} (${pendingFund.title})`,
      });
      onClose();
    } catch (err) {
      console.error('Error receiving fund:', err);
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
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600/20 via-sky-500/10 to-transparent border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Receive Money into Wallet
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transfers from Pending Inflow → In-Hand Income
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

        {/* Source Summary Banner (Sky Blue accent) */}
        <div className="mx-5 mt-4 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">Source / Payer</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{pendingFund.fromWhom}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{pendingFund.title}</p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase block">Pending</span>
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{formatCurrency(remaining)}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount to receive */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Amount Received ({settings.currencySymbol || '₹'}) *
              </label>
              <button
                type="button"
                onClick={() => setReceiveAmount(String(remaining))}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Receive Full ({formatCurrency(remaining)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                {settings.currencySymbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                required
                max={remaining}
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xl font-bold font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Deposit Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Received Via
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Income Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Income Category
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Transferring...' : 'Transfer to Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
