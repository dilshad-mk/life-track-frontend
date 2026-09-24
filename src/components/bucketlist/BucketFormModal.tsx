import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { BucketItem, BucketStatus, Priority, MediaAttachment } from '../../types';
import { useApp } from '../../context/AppContext';

interface BucketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: BucketItem | null;
}

export const BucketFormModal: React.FC<BucketFormModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { addBucketItem, updateBucketItem, bucketCategories } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(bucketCategories[0]?.id || 'bcat_travel');
  const [status, setStatus] = useState<BucketStatus>('planned');
  const [priority, setPriority] = useState<Priority>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || '');
      setCategoryId(itemToEdit.categoryId);
      setStatus(itemToEdit.status);
      setPriority(itemToEdit.priority);
      setTargetDate(itemToEdit.targetDate || '');
      setLocation(itemToEdit.location || '');
      setEstimatedCost(itemToEdit.estimatedCost || '');
      setNotes(itemToEdit.notes || '');
      setAttachments(itemToEdit.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(bucketCategories[0]?.id || 'bcat_travel');
      setStatus('planned');
      setPriority('medium');
      setTargetDate('');
      setLocation('');
      setEstimatedCost('');
      setNotes('');
      setAttachments([]);
    }
  }, [itemToEdit, isOpen, bucketCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (itemToEdit) {
      await updateBucketItem(itemToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        status,
        priority,
        targetDate: targetDate || undefined,
        location: location.trim() || undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        notes: notes.trim() || undefined,
        attachments,
      });
    } else {
      await addBucketItem({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        status,
        priority,
        targetDate: targetDate || undefined,
        location: location.trim() || undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
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
      title={itemToEdit ? 'Edit Bucket Item' : 'New Bucket List Dream'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Dream Experience / Item *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Scuba dive in the Great Barrier Reef"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        {/* Category & Status */}
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
              {bucketCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BucketStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Location & Estimated Cost */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Tokyo, Japan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Budget (₹)
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 50000"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Details
          </label>
          <textarea
            rows={2}
            placeholder="Key memories, research notes, links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none"
          />
        </div>

        {/* Photos & Memories Upload */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={(photos) => {
              const nonPhotos = attachments.filter((a) => a.type !== 'image');
              setAttachments([...nonPhotos, ...photos]);
            }}
            maxFiles={4}
            label="Inspiration & Memory Photos"
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

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            {itemToEdit ? 'Save Changes' : 'Add to Bucket List'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
