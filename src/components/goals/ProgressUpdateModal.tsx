import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Goal } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { updateGoalProgress, formatCurrency } = useApp();
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    if (goal) {
      setValue(goal.currentValue);
    }
  }, [goal]);

  if (!goal) return null;

  const progressPercent = Math.min(
    100,
    Math.round((value / goal.targetValue) * 100)
  );

  const handleQuickAdd = (delta: number) => {
    setValue((prev) => Math.max(0, Math.min(goal.targetValue, prev + delta)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGoalProgress(goal.id, Number(value));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Goal Progress" maxWidth="sm">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-slate-200">{goal.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Target: {goal.unit === '₹' ? formatCurrency(goal.targetValue) : `${goal.targetValue} ${goal.unit || ''}`}
          </p>
        </div>

        {/* Current Value Display & Live Progress */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-2">
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {goal.unit === '₹' ? formatCurrency(value) : `${value} ${goal.unit || ''}`}
          </div>
          <div className="text-xs font-semibold text-slate-300">
            {progressPercent}% Completed
          </div>

          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Manual Input Slider & Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Enter New Value
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Quick Stepper Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[500, 1000, 2500, 5000].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => handleQuickAdd(delta)}
              className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition-all border border-slate-700/60"
            >
              +{goal.unit === '₹' ? `₹${delta}` : delta}
            </button>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            Save Progress
          </button>
        </div>
      </form>
    </Modal>
  );
};
