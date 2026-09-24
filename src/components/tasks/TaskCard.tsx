import React, { useState } from 'react';
import {
  Check,
  Clock,
  Repeat,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTime12Hour, TODAY_IST } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  showDateBadge?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  showDateBadge = false,
}) => {
  const { toggleTask, taskCategories } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const category = taskCategories.find((c) => c.id === task.categoryId);
  const isPastMissed = !task.completed && task.date < TODAY_IST;

  // Priority color tags
  const priorityBadge = {
    low: { label: 'Low', class: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700' },
    medium: { label: 'Med', class: 'text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30' },
    high: { label: 'High', class: 'text-rose-700 dark:text-rose-400 bg-rose-500/15 border-rose-500/30' },
  }[task.priority];

  // Attachments counts
  const imageCount = task.attachments?.filter((a) => a.type === 'image').length || 0;
  const hasVoiceNote = task.attachments?.some((a) => a.type === 'audio');

  return (
    <div
      className={`relative group flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 shadow-sm ${
        task.completed
          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-75'
          : isPastMissed
          ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/40'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-slate-700 shadow-slate-200/50 dark:shadow-slate-950/40'
      }`}
    >
      {/* Single-Tap Completion Toggle Circle */}
      <button
        type="button"
        disabled={isPastMissed}
        onClick={() => !isPastMissed && toggleTask(task.id)}
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
          task.completed
            ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)] active:scale-75'
            : isPastMissed
            ? 'border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-500 cursor-not-allowed'
            : 'border-2 border-slate-400 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 active:scale-75'
        }`}
        title={
          task.completed
            ? 'Mark incomplete'
            : isPastMissed
            ? 'Date passed: Task missed (cannot complete retroactively)'
            : 'Single-tap to complete'
        }
      >
        {task.completed ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : isPastMissed ? (
          <span className="text-[10px] font-bold leading-none">✕</span>
        ) : null}
      </button>

      {/* Task Content */}
      <div
        className={`flex-1 min-w-0 ${!isPastMissed ? 'cursor-pointer' : ''}`}
        onClick={() => !isPastMissed && toggleTask(task.id)}
      >
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {/* Missed Indicator Badge */}
          {isPastMissed && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Missed
            </span>
          )}

          {/* Optional Date Badge (useful in upcoming list) */}
          {showDateBadge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-mono flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              <span>{task.date}</span>
            </span>
          )}

          {/* Category Pill */}
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

          {/* Priority Pill */}
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md border ${priorityBadge.class}`}
          >
            {priorityBadge.label}
          </span>

          {/* Due Time in 12-Hour AM/PM format */}
          {task.dueTime && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatTime12Hour(task.dueTime)}</span>
            </span>
          )}

          {/* Recurrence Indicator */}
          {task.recurrence && task.recurrence !== 'none' && (
            <span className="flex items-center gap-0.5 text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">
              <Repeat className="w-3 h-3" />
              <span className="capitalize">{task.recurrence}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-semibold leading-snug break-words transition-all ${
            task.completed
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {task.title}
        </h4>

        {/* Description / Notes snippet */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Attachments Badges */}
        {(imageCount > 0 || hasVoiceNote) && (
          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-200 dark:border-slate-800/60">
            {imageCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
                <ImageIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>{imageCount} {imageCount === 1 ? 'photo' : 'photos'}</span>
              </span>
            )}
            {hasVoiceNote && (
              <span className="flex items-center gap-1 text-[10px] text-rose-500 dark:text-rose-400 font-medium">
                <Mic className="w-3 h-3" />
                <span>Voice note</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Menu / Actions Button */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-colors"
          title="Task options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Popover Actions Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-30 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(task.id);
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
  );
};
