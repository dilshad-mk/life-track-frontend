import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { Task, Priority, TaskRecurrence, MediaAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTime12Hour, TODAY_IST } from '../../utils/dateUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addTask, updateTask, taskCategories, selectedDate } = useApp();

  const initialDate = selectedDate < TODAY_IST ? TODAY_IST : selectedDate;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState(taskCategories[0]?.id || 'cat_personal');
  const [date, setDate] = useState(initialDate);
  const [dueTime, setDueTime] = useState('');
  const [hasReminder, setHasReminder] = useState(false);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  // Sync state when editing or opening
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategoryId(taskToEdit.categoryId);
      setDate(taskToEdit.date);
      setDueTime(taskToEdit.dueTime || '');
      setHasReminder(!!taskToEdit.hasReminder);
      setRecurrence(taskToEdit.recurrence || 'none');
      setNotes(taskToEdit.notes || '');
      setAttachments(taskToEdit.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategoryId(taskCategories[0]?.id || 'cat_personal');
      setDate(initialDate);
      setDueTime('');
      setHasReminder(false);
      setRecurrence('none');
      setNotes('');
      setAttachments([]);
    }
  }, [taskToEdit, isOpen, selectedDate, taskCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedTime = dueTime ? formatTime12Hour(dueTime) : undefined;

    if (taskToEdit) {
      await updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId,
        date,
        dueTime: formattedTime,
        hasReminder,
        recurrence,
        notes: notes.trim() || undefined,
        attachments,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        categoryId,
        date,
        dueTime: formattedTime,
        hasReminder,
        recurrence,
        notes: notes.trim() || undefined,
        attachments,
      });
    }

    onClose();
  };

  const voiceAttachment = attachments.find((a) => a.type === 'audio');
  const photoAttachments = attachments.filter((a) => a.type === 'image');

  const handleVoiceSave = (att: MediaAttachment) => {
    const nonVoice = attachments.filter((a) => a.type !== 'audio');
    setAttachments([...nonVoice, att]);
  };

  const handleVoiceDelete = () => {
    setAttachments(attachments.filter((a) => a.type !== 'audio'));
  };

  const handlePhotosChange = (photos: MediaAttachment[]) => {
    const nonPhotos = attachments.filter((a) => a.type !== 'image');
    setAttachments([...nonPhotos, ...photos]);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Task Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Study React & State Patterns"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const isSelected = priority === p;
              const config = {
                low: { label: 'Low', color: 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300' },
                medium: { label: 'Medium', color: 'border-amber-400/50 dark:border-amber-500/40 text-amber-600 dark:text-amber-300' },
                high: { label: 'High', color: 'border-rose-400/50 dark:border-rose-500/40 text-rose-600 dark:text-rose-300' },
              }[p];

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-semibold border capitalize transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : `bg-slate-50 dark:bg-slate-800/60 ${config.color} hover:bg-slate-100 dark:hover:bg-slate-800`
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {taskCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              min={TODAY_IST}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Due Time & Recurring Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Time (AM / PM)
            </label>
            <input
              type="time"
              value={dueTime.includes(' ') ? '' : dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. 9:30 AM"
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {dueTime && (
              <span className="text-[10px] text-indigo-500 font-mono mt-0.5 block">
                Formatted: {formatTime12Hour(dueTime)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Recurring
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Every weekday</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add context or notes for this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
          />
        </div>

        {/* Voice Note Section */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <VoiceRecorder
            attachment={voiceAttachment}
            onSave={handleVoiceSave}
            onDelete={handleVoiceDelete}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={handlePhotosChange}
            maxFiles={3}
            label="Attach Photos"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
