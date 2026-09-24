import React, { useState } from 'react';
import {
  Star,
  Calendar,
  Image as ImageIcon,
  Video,
  Mic,
  Trash2,
  Tag,
  Play,
} from 'lucide-react';
import { MemoryItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { VoiceRecorder } from '../media/VoiceRecorder';

interface MemoryCardProps {
  memory: MemoryItem;
  onDelete: (id: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onDelete }) => {
  const { toggleFavoriteMemory } = useApp();
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const photos = memory.attachments.filter((a) => a.type === 'image');
  const videos = memory.attachments.filter((a) => a.type === 'video');
  const voiceNotes = memory.attachments.filter((a) => a.type === 'audio');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-indigo-500/40 transition-all flex flex-col">
      {/* Featured Media Carousel / Header */}
      {videos.length > 0 ? (
        <div className="relative w-full h-48 bg-black">
          <video
            src={videos[0].url}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ) : photos.length > 0 ? (
        <div
          className="relative w-full h-48 overflow-hidden bg-slate-950 cursor-pointer"
          onClick={() => setActivePhoto(photos[0].url)}
        >
          <img
            src={photos[0].url}
            alt={memory.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          {photos.length > 1 && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
              <ImageIcon className="w-3 h-3" />
              <span>+{photos.length - 1} photos</span>
            </span>
          )}
        </div>
      ) : null}

      {/* Card Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Header Tag & Favorite Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {memory.category}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{memory.date}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleFavoriteMemory(memory.id)}
                className={`p-1.5 rounded-xl transition-all active:scale-90 ${
                  memory.isFavorite
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
                title={memory.isFavorite ? 'Remove favorite' : 'Mark as Favorite ⭐'}
              >
                <Star
                  className={`w-4 h-4 ${
                    memory.isFavorite ? 'fill-amber-400' : 'stroke-current'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => onDelete(memory.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Notes */}
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {memory.title}
          </h3>

          {memory.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {memory.description}
            </p>
          )}
        </div>

        {/* Voice Notes Attached */}
        {voiceNotes.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <VoiceRecorder attachment={voiceNotes[0]} onSave={() => {}} />
          </div>
        )}
      </div>

      {/* Lightbox for Photos */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setActivePhoto(null)}
        >
          <img
            src={activePhoto}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
