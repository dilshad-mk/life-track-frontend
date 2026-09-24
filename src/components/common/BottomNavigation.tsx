import React from 'react';
import { Home, CheckSquare, Target, Compass, Wallet } from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, todayRemainingCount, goals, activeDrawer } = useApp();

  const activeGoalsCount = goals.filter((g) => g.status === 'active').length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: todayRemainingCount > 0 ? todayRemainingCount : undefined },
    { id: 'goals', label: 'Goals', icon: Target, badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'bucket', label: 'Bucket List', icon: Compass },
    { id: 'finance', label: 'Finance', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe transition-all shadow-lg">
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && activeDrawer === null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-normal'
              }`}
            >
              {/* Active Indicator Top Glow */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                {/* Badge count */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-white dark:border-slate-950 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
