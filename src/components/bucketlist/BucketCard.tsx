import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { BucketItem, BucketStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface BucketCardProps {
  item: BucketItem;
  onEdit: (item: BucketItem) => void;
  onDelete: (id: string) => void;
  onViewMemories: (item: BucketItem) => void;
}

export const BucketCard: React.FC<BucketCardProps> = ({
  item,
  onEdit,
  onDelete,
  onViewMemories,
}) => {
  const { updateBucketItem, bucketCategories, formatCurrency } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const category = bucketCategories.find((c) => c.id === item.categoryId);

  // Status badges
  const statusBadge = {
    planned: { label: 'Planned', class: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' },
    in_progress: { label: 'In Progress', class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/25' },
    completed: { label: 'Accomplished ✨', class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/25' },
  }[item.status];

  const toggleStatus = async () => {
    let nextStatus: BucketStatus = 'planned';
    if (item.status === 'planned') nextStatus = 'in_progress';
    else if (item.status === 'in_progress') nextStatus = 'completed';
    else if (item.status === 'completed') nextStatus = 'planned';

    await updateBucketItem(item.id, { status: nextStatus });
  };

  const photoAttachments = item.attachments?.filter((a) => a.type === 'image') || [];

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col">
      {/* Featured Photo Header */}
      {photoAttachments.length > 0 && (
        <div
          className="relative h-40 w-full overflow-hidden cursor-pointer bg-slate-950"
          onClick={() => onViewMemories(item)}
        >
          <img
            src={photoAttachments[0].url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {photoAttachments.length > 1 && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
              <ImageIcon className="w-3 h-3" />
              <span>+{photoAttachments.length - 1} more</span>
            </span>
          )}
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Status Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {category && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${category.color}15`,
                    borderColor: `${category.color}35`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
              )}

              {/* Status pill button */}
              <button
                type="button"
                onClick={toggleStatus}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all active:scale-95 ${statusBadge.class}`}
                title="Tap to advance status"
              >
                {statusBadge.label}
              </button>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-7 z-30 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(item);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(item.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className={`text-base font-bold leading-snug ${
              item.status === 'completed' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Location & Cost Info Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {item.location && (
              <span className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span className="truncate max-w-[110px]">{item.location}</span>
              </span>
            )}

            {item.targetDate && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>{item.targetDate}</span>
              </span>
            )}
          </div>

          {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
              {formatCurrency(item.estimatedCost)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
