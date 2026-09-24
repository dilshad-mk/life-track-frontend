import React, { useState } from 'react';
import { ConsistencyDay } from '../../types';
import { useApp } from '../../context/AppContext';

interface CalendarHeatmapProps {
  days?: ConsistencyDay[];
  onSelectDate?: (date: string) => void;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  days,
  onSelectDate,
}) => {
  const { consistencyDays, tasks, settings, selectedDate } = useApp();
  const [hoveredDay, setHoveredDay] = useState<ConsistencyDay | null>(null);

  const threshold = settings.productiveThresholdPercentage || 70;

  // Build real daily activity data from tasks if consistencyDays is empty, or use backend consistencyDays
  const data: ConsistencyDay[] = React.useMemo(() => {
    if (days && days.length > 0) return days;
    if (consistencyDays && consistencyDays.length > 0) return consistencyDays;

    // Fallback: dynamically generate last 84 days from real user tasks
    const generated: ConsistencyDay[] = [];
    const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : (completed > 0 ? 100 : 0);

      let level = 0;
      if (completed >= 4) level = 4;
      else if (completed === 3) level = 3;
      else if (completed === 2) level = 2;
      else if (completed === 1) level = 1;

      generated.push({
        date: dateStr,
        count: completed,
        total: total || (completed > 0 ? completed : 0),
        percentage,
        isProductive: percentage >= threshold,
      });
    }
    return generated;

  }, [days, consistencyDays, tasks, threshold]);

  // Color intensities based on completion rate
  const getColorClass = (day: ConsistencyDay) => {
    if (day.total === 0 || day.count === 0) {
      return 'bg-slate-800/80 hover:ring-1 hover:ring-slate-600';
    }
    const pct = day.percentage;
    if (pct >= threshold) {
      if (pct >= 90) return 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]';
      if (pct >= 80) return 'bg-emerald-600';
      return 'bg-emerald-700';
    } else {
      if (pct >= 40) return 'bg-emerald-900/80';
      return 'bg-slate-800/90';
    }
  };

  // Group into columns of 7 days (weeks)
  const weeks: ConsistencyDay[][] = [];
  let currentWeek: ConsistencyDay[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });


  return (
    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-3">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Consistency Activity
          </h4>
          <p className="text-[11px] text-slate-400">
            Goal: ≥{threshold}% completed tasks / day
          </p>
        </div>
        {hoveredDay ? (
          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {hoveredDay.count}/{hoveredDay.total} ({hoveredDay.percentage}%)
            </span>
            <p className="text-[10px] text-slate-400">{hoveredDay.date}</p>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>More</span>
          </div>
        )}
      </div>

      {/* Heatmap Grid - Horizontal scrolling for mobile */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="flex gap-1.5 min-w-fit">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const isSelected = day.date === selectedDate;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => onSelectDate && onSelectDate(day.date)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-[4px] transition-all cursor-pointer ${getColorClass(
                      day
                    )} ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 scale-125 z-10'
                        : 'active:scale-90'
                    }`}
                    title={`${day.date}: ${day.count}/${day.total} tasks (${day.percentage}%)`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
