import React, { useState, useRef } from 'react';
import { Star, Video, Image as ImageIcon, X } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { ImagePicker } from '../media/ImagePicker';
import { VoiceRecorder } from '../media/VoiceRecorder';
import { MediaAttachment } from '../../types';
import { useApp } from '../../context/AppContext';

interface MemoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryFormModal: React.FC<MemoryFormModalProps> = ({ isOpen, onClose }) => {
  const { addMemory, selectedDate } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [category, setCategory] = useState('Life');
  const [isFavorite, setIsFavorite] = useState(false);
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Video = reader.result as string;
      const newAtt: MediaAttachment = {
        id: `vid_${Date.now()}`,
        type: 'video',
        url: base64Video,
        name: file.name,
        createdAt: new Date().toISOString(),
      };
      setAttachments((prev) => [...prev.filter((a) => a.type !== 'video'), newAtt]);
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setAttachments((prev) => prev.filter((a) => a.type !== 'video'));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addMemory({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      category,
      isFavorite,
      attachments,
    });

    setTitle('');
    setDescription('');
    setAttachments([]);
    setIsFavorite(false);
    onClose();
  };

  const videoAttachment = attachments.find((a) => a.type === 'video');
  const voiceAttachment = attachments.find((a) => a.type === 'audio');
  const photoAttachments = attachments.filter((a) => a.type === 'image');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Capture a Memory 🌟">
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Title & Favorite Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Memory Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Sunset in Palolem, Goa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`mt-5 p-2.5 rounded-xl border flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
            title="Mark as Favorite"
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Date & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Life">Life & Daily</option>
              <option value="Travel">Travel</option>
              <option value="Achievement">Achievement</option>
              <option value="Family">Family & Friends</option>
              <option value="Adventure">Adventure</option>
            </select>
          </div>
        </div>

        {/* Story / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Story / Thoughts (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Write why this moment mattered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Video Upload Section */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-purple-500" />
            <span>Attach Video (Optional)</span>
          </label>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />

          {videoAttachment ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black">
              <video
                src={videoAttachment.url}
                controls
                className="w-full h-36 object-contain"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:text-rose-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium active:scale-95 transition-all"
            >
              <Video className="w-4 h-4 text-purple-400" />
              <span>Upload Video Clip</span>
            </button>
          )}
        </div>

        {/* Photos Upload Section */}
        <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
          <ImagePicker
            attachments={photoAttachments}
            onChange={(photos) => {
              const nonPhotos = attachments.filter((a) => a.type !== 'image');
              setAttachments([...nonPhotos, ...photos]);
            }}
            maxFiles={5}
            label="Photos & Snapshots"
          />
        </div>

        {/* Voice Note Section */}
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all"
          >
            Save to Memories Vault 🌟
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
