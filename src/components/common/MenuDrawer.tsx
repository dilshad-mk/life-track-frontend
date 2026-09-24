import React, { useRef } from 'react';
import {
  X,
  Calendar,
  BarChart3,
  Sliders,
  Tag,
  QrCode,
  Flame,
  Camera,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useApp, DrawerType } from '../../context/AppContext';

export const MenuDrawer: React.FC = () => {
  const { isMenuOpen, closeMenu, openDrawer, user, currentStreak, updateUserAvatar } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isMenuOpen) return null;

  const navigateTo = (type: DrawerType) => {
    openDrawer(type);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateUserAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeMenu}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-300 pb-safe">
        {/* Header Profile Summary */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              title="Tap to change profile picture"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-sm group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</h4>
              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{currentStreak} Day Streak</span>
              </div>
            </div>
          </div>

          <button
            onClick={closeMenu}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Life Management & Vault
          </div>

          <button
            onClick={() => navigateTo('memories')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-500/20 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Memories & Media Vault ⭐</span>
            </div>
            <span className="text-[10px] bg-purple-200 dark:bg-purple-500/30 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-md font-mono">
              New
            </span>
          </button>

          <button
            onClick={() => navigateTo('planner')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Daily Planner & Journal</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigateTo('reports')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Reports & Insights</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigateTo('categories')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Category Manager</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="pt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Device & Preferences
          </div>

          <button
            onClick={() => navigateTo('settings')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-purple-500" />
              <span>App Settings & Currency</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>LifeTrack Personal v1.1</span>
          </div>
          <p className="text-[10px] text-slate-400">Offline-ready • Local Storage</p>
        </div>
      </div>
    </div>
  );
};
