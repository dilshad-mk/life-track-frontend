import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Sun,
  Moon,
  DollarSign,
  Flame,
  Sliders,
  Bell,
  Download,
  Upload,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Save,
  Camera,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    user,
    settings,
    updateUser,
    updateUserAvatar,
    updateSettings,
    toggleTheme,
    closeDrawer,
    openDrawer,
    showToast,
    requestNotificationPermission,
    testNotification,
  } = useApp();

  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [currencyCode, setCurrencyCode] = useState(settings.currency || 'INR');
  const [threshold, setThreshold] = useState<number>(settings.productiveThresholdPercentage || 70);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(settings.notificationsEnabled ?? true);
  const [apiUrl, setApiUrl] = useState(settings.apiUrl || import.meta.env.VITE_API_BASE_URL || 'https://life-track-wy17.onrender.com/api');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user.name) setName(user.name);
    if (user.bio !== undefined) setBio(user.bio);
    if (settings.currencySymbol) setCurrencySymbol(settings.currencySymbol);
    if (settings.currency) setCurrencyCode(settings.currency);
    if (settings.productiveThresholdPercentage !== undefined) setThreshold(settings.productiveThresholdPercentage);
    if (settings.notificationsEnabled !== undefined) setNotificationsEnabled(settings.notificationsEnabled);
    if (settings.apiUrl) setApiUrl(settings.apiUrl);
  }, [user, settings]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({ name, bio });
  };

  const handleSavePreferences = async () => {
    await updateSettings({
      currency: currencyCode,
      currencySymbol,
      productiveThresholdPercentage: Number(threshold),
      apiUrl,
    });
  };

  const handleExportData = async () => {
    const jsonStr = await api.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifetrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully 📦');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const success = await api.importAllData(content);
        if (success) {
          showToast('Data restored! Reloading...', 'success');
          setTimeout(() => window.location.reload(), 800);
        } else {
          showToast('Invalid backup file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const confirmReset = async () => {
    await api.resetToDefaults();
    showToast('Local session data cleared');
    setTimeout(() => window.location.reload(), 600);
  };

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
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Settings & Profile</span>
      </div>

      {/* 1. Profile Card with Avatar Upload */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          <UserIcon className="w-4 h-4 text-indigo-500" />
          <span>Personal Profile & Picture</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="flex items-center gap-3.5">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md group-hover:opacity-85 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block"
              >
                Change Profile Photo 📷
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Personal Bio / Motivation
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* 2. Theme & Currency Preferences */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-purple-500" />
          <span>App Appearance & Currency</span>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Appearance Theme</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {settings.theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold active:scale-95 transition-all shadow-sm ${
              settings.theme === 'dark'
                ? 'bg-slate-700 border-slate-600 text-amber-300'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            {settings.theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Switch to Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Currency Selector */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Currency</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {currencySymbol} ({currencyCode})
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { code: 'INR', symbol: '₹', label: '₹ INR' },
              { code: 'USD', symbol: '$', label: '$ USD' },
              { code: 'EUR', symbol: '€', label: '€ EUR' },
              { code: 'GBP', symbol: '£', label: '£ GBP' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrencyCode(c.code);
                  setCurrencySymbol(c.symbol);
                }}
                className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                  currencyCode === c.code
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Consistency Threshold Setting */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Productive Day Definition
            </span>
            <span className="text-xs font-mono font-bold text-amber-500">
              ≥{threshold}% tasks
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            A day is marked productive on the consistency heatmap if at least {threshold}% of tasks are finished.
          </p>
          <input
            type="range"
            min={40}
            max={100}
            step={5}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={handleSavePreferences}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          Apply Preferences
        </button>
      </div>

      {/* 3. Task Deadline & Due Notifications */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-indigo-500" />
            <span>Task Reminders & Notifications</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              notificationsEnabled
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
          >
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Get notified when pending tasks are due or when the day is about to end so you never break your consistency streak.
        </p>

        {/* Toggle Notification Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Due Task Reminders</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Trigger alerts for urgent & upcoming tasks
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              const nextState = !notificationsEnabled;
              setNotificationsEnabled(nextState);
              await updateSettings({ notificationsEnabled: nextState });
              showToast(nextState ? 'Task notifications enabled 🔔' : 'Notifications muted');
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Actions: Request Permission & Send Test */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-500/30 active:scale-95 transition-all"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Browser Push</span>
          </button>

          <button
            type="button"
            onClick={testNotification}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
          >
            <span>Test Notification ⚡</span>
          </button>
        </div>
      </div>

      {/* 4. Mobile Device Live Preview (Samsung S23) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-cyan-500" />
            <span>Mobile Device Sync</span>
          </div>
          <span className="text-[10px] bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
            Samsung S23 Ready
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Open this app live on your Samsung S23 while developing. Tap below to generate your direct local Wi-Fi QR code.
        </p>

        <button
          type="button"
          onClick={() => openDrawer('qr')}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Show Mobile QR Code</span>
        </button>
      </div>

      {/* 4. Backend API Config */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Backend Integration</span>
          </div>
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            API Base URL (VITE_API_BASE_URL)
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 5. Data Management (Export, Import, Reset) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          <Download className="w-4 h-4 text-amber-500" />
          <span>Data Backup & Restore</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleImportData}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import JSON</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/25 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Local Session Data</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset All Data?"
        message="This will reset all your tasks, goals, finance logs, memories, and journal entries back to initial sample state."
        confirmLabel="Reset Everything"
      />
    </div>
  );
};
