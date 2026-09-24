import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNavigation } from './components/common/BottomNavigation';
import { MenuDrawer } from './components/common/MenuDrawer';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { ToastContainer } from './components/common/ToastContainer';
import { QRCodeModal } from './components/common/QRCodeModal';
import { CategoryManagerModal } from './components/common/CategoryManagerModal';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

// Modals
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { TransactionFormModal } from './components/finance/TransactionFormModal';
import { GoalFormModal } from './components/goals/GoalFormModal';
import { JournalFormModal } from './components/journal/JournalFormModal';
import { MemoryFormModal } from './components/memories/MemoryFormModal';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/Tasks';
import { GoalsPage } from './pages/Goals';
import { BucketListPage } from './pages/BucketList';
import { FinancePage } from './pages/Finance';
import { DailyPlannerPage } from './pages/DailyPlanner';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { MemoriesPage } from './pages/Memories';

export const MainApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeDrawer,
    closeDrawer,
    isMenuOpen,
    closeMenu,
    isLoading,
    isAuthModalOpen,
    closeAuthModal,
  } = useApp();

  // Floating Action Button modal triggers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  // Native Mobile Configuration & Hardware Back Button Handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Dark status bar to blend seamlessly with dark UI
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#020617' }).catch(() => {});
    SplashScreen.hide().catch(() => {});

    // Android hardware back button handler
    const backHandler = CapApp.addListener('backButton', () => {
      // 1. Close open modal if any
      if (isTaskModalOpen) {
        setIsTaskModalOpen(false);
        return;
      }
      if (isFinanceModalOpen) {
        setIsFinanceModalOpen(false);
        return;
      }
      if (isGoalModalOpen) {
        setIsGoalModalOpen(false);
        return;
      }
      if (isJournalModalOpen) {
        setIsJournalModalOpen(false);
        return;
      }
      if (isMemoryModalOpen) {
        setIsMemoryModalOpen(false);
        return;
      }

      // 2. Close side menu drawer if open
      if (isMenuOpen) {
        closeMenu();
        return;
      }

      // 3. Close drawer subpage if active
      if (activeDrawer) {
        closeDrawer();
        return;
      }

      // 4. If on secondary tab, return to Home/Dashboard
      if (activeTab !== 'home') {
        setActiveTab('home');
        return;
      }

      // 5. On Home dashboard, allow standard app minimize
      CapApp.exitApp();
    });

    return () => {
      backHandler.then((h) => h.remove()).catch(() => {});
    };
  }, [
    isTaskModalOpen,
    isFinanceModalOpen,
    isGoalModalOpen,
    isJournalModalOpen,
    isMemoryModalOpen,
    isMenuOpen,
    activeDrawer,
    activeTab,
    closeMenu,
    closeDrawer,
    setActiveTab,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-glow-brand animate-pulse mb-3">
          <span className="text-xl font-bold text-white">LT</span>
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase animate-pulse">
          Loading LifeTrack...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative transition-colors duration-200">
      {/* Top Mobile Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative animate-in fade-in duration-200">
        {/* If drawer view is active, render that specialized screen */}
        {activeDrawer === 'planner' ? (
          <DailyPlannerPage />
        ) : activeDrawer === 'memories' ? (
          <MemoriesPage />
        ) : activeDrawer === 'reports' ? (
          <ReportsPage />
        ) : activeDrawer === 'settings' ? (
          <SettingsPage />
        ) : (
          <>
            {activeTab === 'home' && <Dashboard />}
            {activeTab === 'tasks' && <TasksPage />}
            {activeTab === 'goals' && <GoalsPage />}
            {activeTab === 'bucket' && <BucketListPage />}
            {activeTab === 'finance' && <FinancePage />}
          </>
        )}
      </main>

      {/* Slide-out Menu Drawer */}
      <MenuDrawer />

      {/* Floating Speed-Dial Action Button */}
      <FloatingActionButton
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenFinanceModal={() => setIsFinanceModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenJournalModal={() => setIsJournalModalOpen(true)}
        onOpenMemoryModal={() => setIsMemoryModalOpen(true)}
      />

      {/* Fixed Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Toast Feedback Notifications */}
      <ToastContainer />

      {/* Modals & Dialogs */}
      <QRCodeModal
        isOpen={activeDrawer === 'qr'}
        onClose={closeDrawer}
      />

      <CategoryManagerModal
        isOpen={activeDrawer === 'categories'}
        onClose={closeDrawer}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <TransactionFormModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
      />

      <GoalFormModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <JournalFormModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
      />

      <MemoryFormModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </div>
  );
};
