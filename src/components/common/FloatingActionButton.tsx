import React, { useState } from 'react';
import { Plus, CheckSquare, Wallet, Target, BookOpen, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FABProps {
  onOpenTaskModal: () => void;
  onOpenFinanceModal: () => void;
  onOpenGoalModal: () => void;
  onOpenJournalModal: () => void;
  onOpenMemoryModal: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onOpenTaskModal,
  onOpenFinanceModal,
  onOpenGoalModal,
  onOpenJournalModal,
  onOpenMemoryModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeTab } = useApp();

  const handleMainClick = () => {
    if (activeTab === 'tasks') {
      onOpenTaskModal();
    } else if (activeTab === 'finance') {
      onOpenFinanceModal();
    } else if (activeTab === 'goals') {
      onOpenGoalModal();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenMemoryModal();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span>Capture Memory ⭐</span>
            <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenJournalModal();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span>Journal Note</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenGoalModal();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span>New Goal</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenFinanceModal();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span>Log Transaction</span>
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenTaskModal();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span>New Task</span>
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Main Action Button */}
      <button
        type="button"
        onClick={handleMainClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`w-13 h-13 p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/40 active:scale-90 transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45 bg-slate-800 hover:bg-slate-700 text-slate-300' : ''
        }`}
        title="Quick Add Action"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
