import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { Goal, GoalMilestone, GoalStatus, MediaAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatLocalDateToISO } from '../../utils/dateUtils';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, goalCategories, selectedDate } = useApp();

  const getDefaultTargetDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return formatLocalDateToISO(d);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(goalCategories[0]?.id || 'gcat_finance');
  const [targetValue, setTargetValue] = useState<number>(10000);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('₹');
  const [startDate, setStartDate] = useState(selectedDate);
  const [targetDate, setTargetDate] = useState(getDefaultTargetDate());
  const [status, setStatus] = useState<GoalStatus>('active');
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setCategoryId(goalToEdit.categoryId);
      setTargetValue(goalToEdit.targetValue);
      setCurrentValue(goalToEdit.currentValue);
      setUnit(goalToEdit.unit || '₹');
      setStartDate(goalToEdit.startDate);
      setTargetDate(goalToEdit.targetDate);
      setStatus(goalToEdit.status);
      setMilestones(goalToEdit.milestones || []);
      setNotes(goalToEdit.notes || '');
      setAttachments(goalToEdit.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(goalCategories[0]?.id || 'gcat_finance');
      setTargetValue(10000);
      setCurrentValue(0);
      setUnit('₹');
      setStartDate(selectedDate);
      setTargetDate(getDefaultTargetDate());
      setStatus('active');
      setMilestones([]);
      setNotes('');
      setAttachments([]);
    }
  }, [goalToEdit, isOpen, selectedDate, goalCategories]);

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `ms_${Date.now()}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (goalToEdit) {
      await updateGoal(goalToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        unit,
        startDate,
        targetDate,
        status,
        milestones,
        notes: notes.trim() || undefined,
        attachments,
      });
    } else {
      await addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        unit,
        startDate,
        targetDate,
        status,
        milestones,
        notes: notes.trim() || undefined,
        attachments,
      });
    }

    onClose();
  };

  const voiceAttachment = attachments.find((a) => a.type === 'audio');
  const photoAttachments = attachments.filter((a) => a.type === 'image');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Goal' : 'Create New Goal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Goal Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Goal Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Save ₹12,000 Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {goalCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Measurement Unit
            </label>
            <input
              type="text"
              placeholder="₹, %, km, hours"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Target & Current Values */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Value *
            </label>
            <input
              type="number"
              required
              min={1}
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Value
            </label>
            <input
              type="number"
              min={0}
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Start Date & Target Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Deadline *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Milestones Management */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300">
            Sub-Milestones (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Save first ₹3,000"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMilestone();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {milestones.length > 0 && (
            <div className="space-y-1 pt-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs text-slate-200"
                >
                  <span className="truncate">{m.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Attachments */}
        <div className="pt-1 border-t border-slate-800">
          <VoiceRecorder
            attachment={voiceAttachment}
            onSave={(att) => {
              const nonVoice = attachments.filter((a) => a.type !== 'audio');
              setAttachments([...nonVoice, att]);
            }}
            onDelete={() => setAttachments(attachments.filter((a) => a.type !== 'audio'))}
          />
        </div>

        <div className="pt-1 border-t border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={(photos) => {
              const nonPhotos = attachments.filter((a) => a.type !== 'image');
              setAttachments([...nonPhotos, ...photos]);
            }}
            maxFiles={3}
            label="Motivation Photos"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            {goalToEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
