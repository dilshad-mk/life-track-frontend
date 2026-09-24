import React, { useState } from 'react';
import {
  Plus,
  Star,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowLeft,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MemoryCard } from '../components/memories/MemoryCard';
import { MemoryFormModal } from '../components/memories/MemoryFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const MemoriesPage: React.FC = () => {
  const { memories, deleteMemory, closeDrawer } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'photos' | 'videos' | 'audio'>('all');
  const [memoryToDeleteId, setMemoryToDeleteId] = useState<string | null>(null);

  const filteredMemories = memories.filter((m) => {
    if (filterType === 'favorites') return m.isFavorite;
    if (filterType === 'photos') return m.attachments.some((a) => a.type === 'image');
    if (filterType === 'videos') return m.attachments.some((a) => a.type === 'video');
    if (filterType === 'audio') return m.attachments.some((a) => a.type === 'audio');
    return true;
  });

  const confirmDelete = async () => {
    if (memoryToDeleteId) {
      await deleteMemory(memoryToDeleteId);
      setMemoryToDeleteId(null);
    }
  };

  const favoriteCount = memories.filter((m) => m.isFavorite).length;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeDrawer}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Memories & Vault
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/15 border border-purple-500/20 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Life Vault</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              Personal Memories
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-amber-500">
              {favoriteCount}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              Favorites ⭐
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Store your moments, voice recordings, video snippets, and milestones. Relive them whenever you want.
        </p>

        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: `All (${memories.length})` },
          { id: 'favorites', label: `⭐ Favorites (${favoriteCount})` },
          { id: 'photos', label: '📸 Photos' },
          { id: 'videos', label: '🎥 Videos' },
          { id: 'audio', label: '🎙️ Voice Notes' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
              filterType === f.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Memories Grid / List */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No memories found"
            description="Capture photos, videos, or voice recordings to cherish your milestones and memories."
            actionLabel="Add Memory"
            onAction={() => setIsFormOpen(true)}
          />
        ) : (
          filteredMemories.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              onDelete={(id) => setMemoryToDeleteId(id)}
            />
          ))
        )}
      </div>

      {/* Form Modal */}
      <MemoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!memoryToDeleteId}
        onClose={() => setMemoryToDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Memory?"
        message="Are you sure you want to permanently delete this memory from your vault?"
        confirmLabel="Delete Memory"
      />
    </div>
  );
};
