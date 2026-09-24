import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Calendar as CalendarIcon,
  Filter,
  BarChart2,
  CalendarDays,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HorizontalDatePicker } from '../components/tasks/HorizontalDatePicker';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Task } from '../types';
import { TODAY_IST } from '../utils/dateUtils';
import { AdaptiveAmount } from '../components/common/AdaptiveAmount';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    taskCategories,
    selectedDate,
    setSelectedDate,
    deleteTask,
    todayCompletedCount,
    todayTotalCount,
    todayCompletionRate,
    upcomingTasks,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewFilter, setViewFilter] = useState<'selected' | 'upcoming' | 'pending' | 'completed' | 'all'>('selected');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Compute filtered tasks list based on viewFilter
  const filteredTasks = tasks.filter((t) => {
    // 1. Category filter
    if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) return false;

    // 2. View/Status filter
    if (viewFilter === 'selected') {
      return t.date === selectedDate;
    }
    if (viewFilter === 'upcoming') {
      return t.date > TODAY_IST;
    }
    if (viewFilter === 'pending') {
      return !t.completed && (t.date === selectedDate || t.date <= TODAY_IST);
    }
    if (viewFilter === 'completed') {
      return t.completed && t.date === selectedDate;
    }
    // 'all'
    return true;
  });

  // Sort upcoming tasks chronologically
  if (viewFilter === 'upcoming') {
    filteredTasks.sort((a, b) => a.date.localeCompare(b.date));
  }

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDeleteId) {
      await deleteTask(taskToDeleteId);
      setTaskToDeleteId(null);
    }
  };

  const isPastSelected = selectedDate < TODAY_IST;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* 1. Date Selector Strip */}
      <HorizontalDatePicker />

      {/* 2. Consistency Summary Header Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Consistency Metrics
            </h3>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Hide Activity' : 'View Heatmap'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Today</span>
            <div className="mt-0.5 min-w-0">
              <AdaptiveAmount
                value={`${todayCompletedCount}/${todayTotalCount}`}
                mode="metric"
                className="text-slate-900 dark:text-slate-100 font-bold font-mono"
              />
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold truncate block">
              {todayCompletionRate}%
            </span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Weekly</span>
            <div className="mt-0.5 min-w-0">
              <AdaptiveAmount
                value="85%"
                mode="metric"
                className="text-emerald-600 dark:text-emerald-400 font-bold font-mono"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate block">Streak on</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 min-w-0 overflow-hidden flex flex-col justify-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Upcoming</span>
            <div className="mt-0.5 min-w-0">
              <AdaptiveAmount
                value={`${upcomingTasks.length} tasks`}
                mode="metric"
                className="text-purple-600 dark:text-purple-400 font-bold font-mono"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate block">Scheduled</span>
          </div>
        </div>

        {/* Expandable GitHub Contribution Heatmap */}
        {showHeatmap && (
          <div className="pt-2 animate-in fade-in duration-300">
            <CalendarHeatmap onSelectDate={(d) => setSelectedDate(d)} />
          </div>
        )}
      </div>

      {/* 3. Task Views & Filter Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* View Filter Pills */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] overflow-x-auto no-scrollbar">
            {[
              { id: 'selected', label: 'Day View' },
              { id: 'upcoming', label: `Upcoming (${upcomingTasks.length})` },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewFilter(v.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  viewFilter === v.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Only show Add Task button if not viewing a past date in selected view */}
          {(!isPastSelected || viewFilter !== 'selected') && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Past Date History Notice */}
        {isPastSelected && viewFilter === 'selected' && (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Past date record: Incomplete tasks are locked as missed. Adding tasks for past dates is disabled.</span>
          </div>
        )}

        {/* Horizontal Category Badges */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40 font-semibold'
                : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {taskCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
                selectedCategoryFilter === cat.id
                  ? 'border-transparent font-semibold shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              style={
                selectedCategoryFilter === cat.id
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

      {/* 4. Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={viewFilter === 'upcoming' ? 'No upcoming tasks' : 'No tasks found'}
            description={
              viewFilter === 'upcoming'
                ? 'You have no future tasks scheduled. Plan ahead by adding upcoming tasks.'
                : isPastSelected && viewFilter === 'selected'
                ? 'No tasks were logged for this past date.'
                : 'Clear your filter or add your first task.'
            }
            actionLabel={isPastSelected && viewFilter === 'selected' ? undefined : "Create Task"}
            onAction={isPastSelected && viewFilter === 'selected' ? undefined : handleAddNew}
          />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showDateBadge={viewFilter === 'upcoming' || viewFilter === 'all'}
              onEdit={handleEdit}
              onDelete={(id) => setTaskToDeleteId(id)}
            />
          ))
        )}
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!taskToDeleteId}
        onClose={() => setTaskToDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Task?"
        message="Are you sure you want to permanently delete this task?"
        confirmLabel="Delete Task"
      />
    </div>
  );
};
