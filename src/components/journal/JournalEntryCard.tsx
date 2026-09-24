import React from 'react';
import {
  Calendar,
  Smile,
  Edit2,
  Image as ImageIcon,
  Mic,
  Award,
  Sparkles,
} from 'lucide-react';
import { JournalEntry } from '../../types';
import { VoiceRecorder } from '../media/VoiceRecorder';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit }) => {
  const moodConfig = {
    great: { label: 'Energized & Focused 🔥', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    good: { label: 'Good & Productive 🌿', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    neutral: { label: 'Steady & Calm ☕', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    low: { label: 'Tired / Low Energy 💤', color: 'text-slate-400 bg-slate-800 border-slate-700' },
    tough: { label: 'Challenging Day 🌧️', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  }[entry.mood || 'good'];

  const photos = entry.attachments?.filter((a) => a.type === 'image') || [];
  const voiceNote = entry.attachments?.find((a) => a.type === 'audio');

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 font-mono">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{entry.date}</span>
          </span>

          {entry.mood && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${moodConfig.color}`}
            >
              {moodConfig.label}
            </span>
          )}
        </div>

        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Edit Journal Entry"
        >
          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

      {/* Content */}
      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
        "{entry.content}"
      </p>

      {/* Daily Achievements Highlight */}
      {entry.achievements && entry.achievements.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Daily Wins & Highlights</span>
          </div>
          <div className="space-y-1">
            {entry.achievements.map((ach, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-slate-300 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5 rounded-lg"
              >
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{ach}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Note player if present */}
      {voiceNote && (
        <div className="pt-1">
          <VoiceRecorder attachment={voiceNote} onSave={() => {}} />
        </div>
      )}

      {/* Photo attachments if present */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          {photos.map((p) => (
            <div
              key={p.id}
              className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800"
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
