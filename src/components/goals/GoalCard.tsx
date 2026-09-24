import React, { useState } from 'react';
import {
  Target,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  MoreVertical,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Image as ImageIcon,
} from 'lucide-react';
import { Goal } from '../../types';
import { useApp } from '../../context/AppContext';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const { goalCategories, updateGoal, formatCurrency } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const category = goalCategories.find((c) => c.id === goal.categoryId);

  // Calculate percentage
  const progressPercent = Math.min(
    100,
    Math.round((goal.currentValue / goal.targetValue) * 100)
  );

  // Format values according to unit
  const formatVal = (val: number) => {
    if (goal.unit === '₹') return formatCurrency(val);
    return `${val.toLocaleString()} ${goal.unit || ''}`;
  };

  // Calculate deadline countdown & pace
  const calculatePace = () => {
    try {
      const today = new Date();
      const start = new Date(goal.startDate + 'T12:00:00');
      const target = new Date(goal.targetDate + 'T12:00:00');

      const totalDuration = target.getTime() - start.getTime();
      const elapsed = today.getTime() - start.getTime();
      const remainingDays = Math.ceil(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (remainingDays <= 0) {
        return {
          text: 'Deadline passed',
          status: 'behind',
          days: 0,
        };
      }

      const expectedPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

      if (progressPercent >= expectedPercent) {
        return {
          text: `${remainingDays}d left • Ahead`,
          status: 'ahead',
          days: remainingDays,
        };
      } else {
        return {
          text: `${remainingDays}d left • Needs focus`,
          status: 'behind',
          days: remainingDays,
        };
      }
    } catch {
      return { text: goal.targetDate, status: 'ahead', days: 30 };
    }
  };

  const pace = calculatePace();

  // Toggle milestone
  const toggleMilestone = async (mId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === mId ? { ...m, completed: !m.completed } : m
    );
    await updateGoal(goal.id, { milestones: updatedMilestones });
  };

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  return (
    <div className="relative group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400/50 dark:hover:border-slate-700 transition-all space-y-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {category && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${category.color}15`,
                borderColor: `${category.color}35`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}

          {/* Pace status pill */}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              pace.status === 'ahead'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/25'
            }`}
          >
            {pace.status === 'ahead' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            <span>{pace.text}</span>
          </span>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-30 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(goal);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(goal.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goal Title & Description */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{goal.title}</h3>
        {goal.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Numerical Target Display */}
      <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
            {formatVal(goal.currentValue)}
            <span className="text-slate-400 font-normal"> / {formatVal(goal.targetValue)}</span>
          </span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 100
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span>Remaining: {formatVal(Math.max(0, goal.targetValue - goal.currentValue))}</span>
          <button
            type="button"
            onClick={() => onUpdateProgress(goal)}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold active:scale-95 transition-transform"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Update Value</span>
          </button>
        </div>
      </div>

      {/* Milestones Checklist */}
      {goal.milestones.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Milestones</span>
            <span>
              {completedMilestones}/{goal.milestones.length}
            </span>
          </div>

          <div className="space-y-1">
            {goal.milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMilestone(m.id)}
                className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left text-xs transition-colors active:scale-98 ${
                  m.completed
                    ? 'text-slate-400 line-through bg-slate-50 dark:bg-slate-800/30'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {m.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{m.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {goal.attachments && goal.attachments.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <ImageIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          <span>{goal.attachments.length} attachments</span>
        </div>
      )}
    </div>
  );
};
