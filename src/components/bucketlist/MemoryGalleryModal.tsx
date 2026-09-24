import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { BucketItem } from '../../types';
import { Modal } from '../common/Modal';

interface MemoryGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BucketItem | null;
}

export const MemoryGalleryModal: React.FC<MemoryGalleryModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!item) return null;

  const photos = item.attachments?.filter((a) => a.type === 'image') || [];
  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.title} maxWidth="lg">
      <div className="space-y-4">
        {/* Photo Display with Next/Prev Controls */}
        <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.name || item.title}
            className="w-full h-full object-contain"
          />

          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicator Counter */}
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-mono backdrop-blur-md">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-indigo-500 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          {item.location && (
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{item.location}</span>
            </span>
          )}
          {item.completedAt && (
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Accomplished: {item.completedAt}</span>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
