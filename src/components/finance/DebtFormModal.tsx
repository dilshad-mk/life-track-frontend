import React, { useState, useEffect } from 'react';
import { X, Scale, Calendar, User, DollarSign, FileText, Tag, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Debt } from '../../types';
import { TODAY_IST } from '../../utils/dateUtils';

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt?: Debt | null;
}

const DEBT_CATEGORIES = [
  'Personal Loan',
  'Friend / Family',
  'Credit Card / EMI',
  'Bank / Institution',
  'Business / Vendor',
  'Rent / Utility Due',
  'Other',
];

export const DebtFormModal: React.FC<DebtFormModalProps> = ({
  isOpen,
  onClose,
  debt,
}) => {
  const { addDebt, updateDebt, settings } = useApp();

  const [toWhom, setToWhom] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(TODAY_IST);
  const [borrowedDate, setBorrowedDate] = useState(TODAY_IST);
  const [category, setCategory] = useState(DEBT_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debt) {
      setToWhom(debt.toWhom);
      setTitle(debt.title);
      setAmount(String(debt.amount));
      setDueDate(debt.dueDate);
      setBorrowedDate(debt.borrowedDate || TODAY_IST);
      setCategory(debt.category || DEBT_CATEGORIES[0]);
      setNotes(debt.notes || '');
    } else {
      setToWhom('');
      setTitle('');
      setAmount('');
      setDueDate(TODAY_IST);
      setBorrowedDate(TODAY_IST);
      setCategory(DEBT_CATEGORIES[0]);
      setNotes('');
    }
  }, [debt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toWhom.trim() || !title.trim() || !amount || Number(amount) <= 0) return;

    try {
      setIsSubmitting(true);
      if (debt) {
        await updateDebt(debt.id, {
          toWhom: toWhom.trim(),
          title: title.trim(),
          amount: Number(amount),
          dueDate,
          borrowedDate,
          category,
          notes: notes.trim(),
        });
      } else {
        await addDebt({
          toWhom: toWhom.trim(),
          title: title.trim(),
          amount: Number(amount),
          dueDate,
          borrowedDate,
          category,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving debt:', err);
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
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header with Amber / Rose theme */}
        <div className="p-4 bg-gradient-to-r from-amber-600/20 via-rose-500/10 to-transparent border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {debt ? 'Edit Debt Record' : 'Record Money I Owe (Debt)'}
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Track who you owe and repayment schedules
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
              Debt Amount ({settings.currencySymbol || '₹'}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-amber-600 dark:text-amber-400 text-lg">
                {settings.currencySymbol || '₹'}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-amber-500/5 dark:bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xl font-bold font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* To Whom (Lender / Creditor) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              To Whom (Lender / Creditor Name) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. John, Bank Name, Brother"
                value={toWhom}
                onChange={(e) => setToWhom(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Purpose / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Purpose / Reason *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Laptop EMI split, Medical emergency loan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Due Date & Borrowed Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Repayment Due Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {DEBT_CATEGORIES.map((c) => (
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
              Notes / Terms (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Interest rate, terms, or account info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : debt ? 'Save Changes' : 'Record Debt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
