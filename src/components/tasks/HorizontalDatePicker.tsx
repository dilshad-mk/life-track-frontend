import React, { useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatLocalDateToISO, parseISODate, formatFriendlyDate, TODAY_IST } from '../../utils/dateUtils';

export const HorizontalDatePicker: React.FC = () => {
  const { selectedDate, setSelectedDate } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 7 days before and 14 days after today using local date math (no UTC shift)
  const baseDate = parseISODate(TODAY_IST);
  const days: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean }[] = [];

  for (let i = -7; i <= 14; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i, 12, 0, 0);
    const dateStr = formatLocalDateToISO(d);
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
    const dayNum = d.getDate();
    const isToday = dateStr === TODAY_IST;

    days.push({ dateStr, dayName, dayNum, monthName, isToday });
  }

  // Auto-scroll selected date into view
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{formatFriendlyDate(selectedDate)}</span>
        </div>
        {selectedDate !== TODAY_IST && (
          <button
            type="button"
            onClick={() => setSelectedDate(TODAY_IST)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 active:scale-95 transition-all"
          >
            Jump to Today
          </button>
        )}
      </div>

      {/* Date Pill Scroller */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
      >
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;

          return (
            <button
              key={item.dateStr}
              data-selected={isSelected}
              type="button"
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex flex-col items-center justify-center min-w-[54px] py-2 px-1.5 rounded-2xl transition-all duration-200 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35 ring-2 ring-indigo-400'
                  : item.isToday
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:bg-slate-800 shadow-sm'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider mb-0.5">
                {item.dayName}
              </span>
              <span
                className={`text-base font-bold font-mono leading-none ${
                  isSelected ? 'text-white' : item.isToday ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {item.dayNum}
              </span>
              <span className="text-[9px] font-medium opacity-70 mt-0.5">
                {item.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
