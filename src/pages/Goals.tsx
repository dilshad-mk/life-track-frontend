import React, { useState } from 'react';
import {
  Plus,
  Target,
  Filter,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalFormModal } from '../components/goals/GoalFormModal';
import { ProgressUpdateModal } from '../components/goals/ProgressUpdateModal';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Goal } from '../types';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    goalCategories,
    deleteGoal,
    overallGoalProgress,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredGoals = goals.filter((g) => {
    if (selectedCategory !== 'all' && g.categoryId !== selectedCategory) return false;
    if (statusFilter === 'active' && g.status !== 'active') return false;
    if (statusFilter === 'completed' && g.status !== 'completed') return false;
    return true;
  });

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setGoalToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (goalToDeleteId) {
      await deleteGoal(goalToDeleteId);
      setGoalToDeleteId(null);
    }
  };

  const activeCount = goals.filter((g) => g.status === 'active').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* 1. Overall Progress Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900 border border-indigo-500/25 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Overall Goal Completion
            </span>
            <div className="text-2xl font-extrabold text-slate-100 font-mono mt-0.5">
              {overallGoalProgress}%
            </div>
          </div>
          <div className="flex gap-2 text-center">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Active</span>
              <span className="text-xs font-bold text-indigo-400 font-mono">{activeCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Finished</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{completedCount}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${overallGoalProgress}%` }}
          />
        </div>
      </div>

      {/* 2. Filter & Add Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Status Switcher */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['active', 'completed', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Category Horizontal Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {goalCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
                selectedCategory === cat.id
                  ? 'border-transparent font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              style={
                selectedCategory === cat.id
                  ? {
                      backgroundColor: `${cat.color}25`,
                      borderColor: cat.color,
                      color: cat.color,
                    }
                  : {}
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Goal Cards List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals found"
            description="Set a meaningful goal, break it into milestones, and track your progress."
            actionLabel="Create Goal"
            onAction={handleAddNew}
          />
        ) : (
          filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={(id) => setGoalToDeleteId(id)}
              onUpdateProgress={(g) => setSelectedGoalForProgress(g)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        goalToEdit={goalToEdit}
      />

      <ProgressUpdateModal
        isOpen={!!selectedGoalForProgress}
        onClose={() => setSelectedGoalForProgress(null)}
        goal={selectedGoalForProgress}
      />

      <ConfirmationModal
        isOpen={!!goalToDeleteId}
        onClose={() => setGoalToDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Goal?"
        message="Are you sure you want to permanently delete this goal?"
        confirmLabel="Delete Goal"
      />
    </div>
  );
};
