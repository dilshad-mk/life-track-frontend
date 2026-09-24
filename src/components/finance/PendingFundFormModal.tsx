import React, { useState, useEffect } from 'react';
import { X, HandCoins, Calendar, User, DollarSign, FileText, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PendingFund } from '../../types';
import { TODAY_IST } from '../../utils/dateUtils';

interface PendingFundFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingFund?: PendingFund | null;
}

const CATEGORIES = [
  'Freelance / Client',
  'Salary / Bonus Due',
  'Friend / Family',
  'Refund / Cashback',
  'Investment Return',
  'Business Inflow',
  'Other',
];

export const PendingFundFormModal: React.FC<PendingFundFormModalProps> = ({
  isOpen,
  onClose,
  pendingFund,
}) => {
  const { addPendingFund, updatePendingFund, settings } = useApp();

  const [title, setTitle] = useState('');
  const [fromWhom, setFromWhom] = useState('');
  const [amount, setAmount] = useState('');
  const [expectedDate, setExpectedDate] = useState(TODAY_IST);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pendingFund) {
      setTitle(pendingFund.title);
      setFromWhom(pendingFund.fromWhom);
      setAmount(String(pendingFund.amount));
      setExpectedDate(pendingFund.expectedDate);
      setCategory(pendingFund.category || CATEGORIES[0]);
      setNotes(pendingFund.notes || '');
    } else {
      setTitle('');
      setFromWhom('');
      setAmount('');
      setExpectedDate(TODAY_IST);
      setCategory(CATEGORIES[0]);
      setNotes('');
    }
  }, [pendingFund, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fromWhom.trim() || !amount || Number(amount) <= 0) return;

    try {
      setIsSubmitting(true);
      if (pendingFund) {
        await updatePendingFund(pendingFund.id, {
          title: title.trim(),
          fromWhom: fromWhom.trim(),
          amount: Number(amount),
          expectedDate,
          category,
          notes: notes.trim(),
        });
      } else {
        await addPendingFund({
          title: title.trim(),
          fromWhom: fromWhom.trim(),
          amount: Number(amount),
          expectedDate,
          category,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving pending fund:', err);
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
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header with Sky Blue theme */}
        <div className="p-4 bg-gradient-to-r from-sky-600/20 via-sky-500/10 to-transparent border-b border-sky-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-500 dark:text-sky-400 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {pendingFund ? 'Edit Expected Inflow' : 'Money Not in Hand (Expected)'}
              </h3>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                Track money that will arrive in a few days
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Expected Amount ({settings.currencySymbol || '₹'}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-sky-600 dark:text-sky-400 text-lg">
                {settings.currencySymbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-sky-500/5 dark:bg-sky-950/30 border border-sky-500/30 rounded-2xl text-xl font-bold font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Purpose / Title *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Freelance Web Design Project, Bonus"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* From Whom / Source */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              From Whom (Payer / Source) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Client name, Company, Friend"
                value={fromWhom}
                onChange={(e) => setFromWhom(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Expected Date & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Expected Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any details, invoice number, or conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : pendingFund ? 'Save Changes' : 'Add Expected Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
