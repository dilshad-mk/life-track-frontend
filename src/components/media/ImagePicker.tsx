import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Eye } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface ImagePickerProps {
  attachments?: MediaAttachment[];
  onChange: (attachments: MediaAttachment[]) => void;
  maxFiles?: number;
  label?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  attachments = [],
  onChange,
  maxFiles = 3,
  label = 'Photos & Receipts',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (attachments.length >= maxFiles) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        const newAttachment: MediaAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'image',
          url: base64Url,
          name: file.name,
          createdAt: new Date().toISOString(),
        };
        onChange([...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same image can be re-selected if deleted
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          {attachments.length}/{maxFiles}
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Image Thumbnails and Upload Trigger */}
      <div className="flex flex-wrap gap-2.5">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="relative w-20 h-20 rounded-xl overflow-hidden group border border-slate-700 bg-slate-800 shadow-md"
          >
            <img
              src={att.url}
              alt={att.name || 'Attachment'}
              className="w-full h-full object-cover"
            />
            {/* View Lightbox */}
            <button
              type="button"
              onClick={() => setLightboxUrl(att.url)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeAttachment(att.id)}
              className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add photo trigger button */}
        {attachments.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-800/60 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-all active:scale-95 gap-1"
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-medium">Add Photo</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-xl max-h-[85vh]">
            <img
              src={lightboxUrl}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
