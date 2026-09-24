import React, { useState } from 'react';
import {
  Plus,
  Compass,
  Sparkles,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BucketCard } from '../components/bucketlist/BucketCard';
import { BucketFormModal } from '../components/bucketlist/BucketFormModal';
import { MemoryGalleryModal } from '../components/bucketlist/MemoryGalleryModal';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { BucketItem, BucketStatus } from '../types';

export const BucketListPage: React.FC = () => {
  const {
    bucketItems,
    bucketCategories,
    deleteBucketItem,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BucketItem | null>(null);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [selectedItemForMemories, setSelectedItemForMemories] = useState<BucketItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BucketStatus>('all');

  const filteredItems = bucketItems.filter((b) => {
    if (selectedCategory !== 'all' && b.categoryId !== selectedCategory) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const handleEdit = (item: BucketItem) => {
    setItemToEdit(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setItemToEdit(null);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDeleteId) {
      await deleteBucketItem(itemToDeleteId);
      setItemToDeleteId(null);
    }
  };

  const completedCount = bucketItems.filter((b) => b.status === 'completed').length;
  const inProgressCount = bucketItems.filter((b) => b.status === 'in_progress').length;
  const plannedCount = bucketItems.filter((b) => b.status === 'planned').length;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* 1. Header Banner & Stats */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-slate-900 border border-purple-500/25 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                Life Bucket List
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight mt-0.5">
              Experiences & Dreams
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {completedCount}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">Checked off ✨</span>
          </div>
        </div>

        {/* 3 Status Counters */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Planned</span>
            <span className="text-xs font-bold text-slate-200 font-mono">{plannedCount}</span>
          </div>
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">In Progress</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{inProgressCount}</span>
          </div>
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <span className="text-[10px] text-slate-400 block">Accomplished</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Add Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Status Filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
            {(['all', 'planned', 'in_progress', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'in_progress' ? 'Active' : st}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            All Dreams
          </button>
          {bucketCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 border transition-all ${
                selectedCategory === cat.id
                  ? 'border-transparent font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              style={
                selectedCategory === cat.id
                  ? {
                      backgroundColor: `${cat.color}25`,
                      borderColor: cat.color,
                      color: cat.color,
                    }
                  : {}
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Cards Grid */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No bucket list items"
            description="Add adventures, skills, travel destinations, or milestone experiences you want to achieve."
            actionLabel="Add Bucket Item"
            onAction={handleAddNew}
          />
        ) : (
          filteredItems.map((item) => (
            <BucketCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={(id) => setItemToDeleteId(id)}
              onViewMemories={(it) => setSelectedItemForMemories(it)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <BucketFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        itemToEdit={itemToEdit}
      />

      <MemoryGalleryModal
        isOpen={!!selectedItemForMemories}
        onClose={() => setSelectedItemForMemories(null)}
        item={selectedItemForMemories}
      />

      <ConfirmationModal
        isOpen={!!itemToDeleteId}
        onClose={() => setItemToDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Bucket Item?"
        message="Are you sure you want to remove this item from your bucket list?"
        confirmLabel="Delete Item"
      />
    </div>
  );
};
