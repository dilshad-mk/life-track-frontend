import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import {
  TransactionType,
  PaymentMethod,
  MediaAttachment,
} from '../../types';
import { useApp } from '../../context/AppContext';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { addTransaction, financeCategories, goals, selectedDate } = useApp();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / GPay');
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  // Filter categories by selected type
  const availableCategories = financeCategories.filter((c) => c.type === type);

  useEffect(() => {
    setType(defaultType);
    setAmount('');
    setDescription('');
    setDate(selectedDate);
    setPaymentMethod('UPI / GPay');
    setLinkedGoalId('');
    setAttachments([]);
  }, [defaultType, isOpen, selectedDate]);

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.id === categoryId)) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    await addTransaction({
      amount: Number(amount),
      type,
      categoryId,
      date,
      description: description.trim() || (type === 'income' ? 'Income' : 'Expense'),
      paymentMethod,
      linkedGoalId: linkedGoalId || undefined,
      attachments,
    });

    onClose();
  };

  const voiceAttachment = attachments.find((a) => a.type === 'audio');
  const photoAttachments = attachments.filter((a) => a.type === 'image');

  const financialGoals = goals.filter((g) => g.status === 'active' && g.unit === '₹');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'income' ? 'Log Income 💰' : 'Record Expense 🧾'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Type Toggle: Expense vs Income */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount Input (Large & Focused) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold font-mono text-slate-400">
              ₹
            </span>
            <input
              type="number"
              required
              autoFocus
              min={1}
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UPI / GPay">UPI / GPay</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Description & Date Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? 'Salary, Client payout...' : 'Groceries, Coffee...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Optional Link to Financial Goal */}
        {financialGoals.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link to Savings Goal (Optional)
            </label>
            <select
              value={linkedGoalId}
              onChange={(e) => setLinkedGoalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Don't link)</option>
              {financialGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.unit === '₹' ? `Target: ₹${g.targetValue.toLocaleString('en-IN')}` : ''})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Receipt Photo Upload */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={(photos) => {
              const nonPhotos = attachments.filter((a) => a.type !== 'image');
              setAttachments([...nonPhotos, ...photos]);
            }}
            maxFiles={2}
            label="Bill / Receipt Photo"
          />
        </div>

        {/* Voice Note */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <VoiceRecorder
            attachment={voiceAttachment}
            onSave={(att) => {
              const nonVoice = attachments.filter((a) => a.type !== 'audio');
              setAttachments([...nonVoice, att]);
            }}
            onDelete={() => setAttachments(attachments.filter((a) => a.type !== 'audio'))}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg active:scale-98 transition-all ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
            }`}
          >
            {type === 'income' ? 'Save Income' : 'Record Expense'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
