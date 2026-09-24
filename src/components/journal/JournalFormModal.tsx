import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { JournalEntry, MediaAttachment } from '../../types';
import { useApp } from '../../context/AppContext';

interface JournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
}

export const JournalFormModal: React.FC<JournalFormModalProps> = ({
  isOpen,
  onClose,
  date,
}) => {
  const { saveJournalEntry, getJournalForDate, selectedDate } = useApp();

  const entryDate = date || selectedDate;
  const existing = getJournalForDate(entryDate);

  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'low' | 'tough'>('good');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  useEffect(() => {
    if (existing) {
      setContent(existing.content);
      setMood(existing.mood || 'good');
      setAchievements(existing.achievements || []);
      setAttachments(existing.attachments || []);
    } else {
      setContent('');
      setMood('good');
      setAchievements([]);
      setAttachments([]);
    }
  }, [existing, isOpen, entryDate]);

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await saveJournalEntry({
      date: entryDate,
      content: content.trim(),
      mood,
      achievements,
      attachments,
    });

    onClose();
  };

  const voiceAttachment = attachments.find((a) => a.type === 'audio');
  const photoAttachments = attachments.filter((a) => a.type === 'image');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Daily Reflection • ${entryDate}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Mood Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            How was your day?
          </label>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              { id: 'great', emoji: '🔥', label: 'Great' },
              { id: 'good', emoji: '🌿', label: 'Good' },
              { id: 'neutral', emoji: '☕', label: 'Calm' },
              { id: 'low', emoji: '💤', label: 'Tired' },
              { id: 'tough', emoji: '🌧️', label: 'Tough' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id as any)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all active:scale-95 ${
                  mood === m.id
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[10px] font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Daily Journal & Thoughts *
          </label>
          <textarea
            required
            autoFocus
            rows={4}
            placeholder="Write freely about today's wins, lessons learned, or mindsets..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-none leading-relaxed"
          />
        </div>

        {/* Wins & Achievements */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300">
            Daily Wins (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Finished morning workout, saved ₹1,500"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAchievement();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddAchievement}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {achievements.length > 0 && (
            <div className="space-y-1">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-200"
                >
                  <span className="truncate">{ach}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(idx)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Note */}
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

        {/* Photos */}
        <div className="pt-1 border-t border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={(photos) => {
              const nonPhotos = attachments.filter((a) => a.type !== 'image');
              setAttachments([...nonPhotos, ...photos]);
            }}
            maxFiles={3}
            label="Daily Photos & Memories"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            Save Journal
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
