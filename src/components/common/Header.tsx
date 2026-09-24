import React, { useRef, useState } from 'react';
import { Flame, Menu, Sun, Moon, Bell, Camera, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFriendlyDate, formatTime12Hour } from '../../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    user,
    currentStreak,
    settings,
    toggleTheme,
    openDrawer,
    openMenu,
    selectedDate,
    updateUserAvatar,
    dueTaskSummary,
    requestNotificationPermission,
    toggleTask,
  } = useApp();


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const pendingCount = dueTaskSummary.allPendingToday.length;
  const urgentCount = dueTaskSummary.urgentTasks.length;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Avatar & Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Strictly Circular Profile Avatar Container */}
          <div
            className="relative group cursor-pointer shrink-0 w-9 h-9 rounded-full overflow-hidden aspect-square border-2 border-indigo-500/40 shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Change profile photo"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity rounded-full"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {getGreeting()}, {user.name || 'Friend'}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
              {formatFriendlyDate(selectedDate)}
            </p>
          </div>
        </div>

        {/* Right: Actions (Streak, Theme, Notifications, Menu) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Consistency Streak Pill */}
          <button
            type="button"
            onClick={() => openDrawer('reports')}
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-bold active:scale-95 transition-transform"
            title="Consistency Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentStreak}d</span>
          </button>


          {/* Theme Switcher Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all active:scale-90 shadow-sm ${
              settings.theme === 'dark'
                ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:text-white'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Notification Bell with Badge & Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl border transition-all active:scale-95 shadow-sm relative ${
                urgentCount > 0
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : pendingCount > 0
                  ? 'bg-indigo-50 dark:bg-slate-800/60 border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title="Task Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center text-white border-2 border-white dark:border-slate-950 shadow-sm ${
                    urgentCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Task Reminders
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                      {pendingCount} remaining
                    </span>
                  </div>

                  {/* Urgent Alert Banner */}
                  {urgentCount > 0 && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <strong className="block font-bold">Finish before day ends!</strong>
                        <span className="text-[11px] leading-tight">
                          {dueTaskSummary.message}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pending task items preview */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 no-scrollbar py-0.5">
                    {pendingCount === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span>All tasks for today are completed! 🎉</span>
                      </div>
                    ) : (
                      dueTaskSummary.allPendingToday.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            toggleTask(task.id);
                          }}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {task.title}
                            </h5>
                            {task.dueTime && (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                <span>{formatTime12Hour(task.dueTime)}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            Tap to complete
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Enable system notifications button */}
                  <button
                    type="button"
                    onClick={() => {
                      requestNotificationPermission();
                      setShowNotifications(false);
                    }}
                    className="w-full py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-500/30 transition-all text-center"
                  >
                    🔔 Enable System Notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={openMenu}
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-sm shadow-indigo-600/30 ml-0.5"
            title="Open Menu Drawer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
