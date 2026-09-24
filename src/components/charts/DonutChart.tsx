import React from 'react';
import { useApp } from '../../context/AppContext';

interface Slice {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: {
    categoryId: string;
    categoryName: string;
    amount: number;
    color: string;
  }[];
  total: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  const { formatCurrency } = useApp();

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
        <span>No expenses recorded for this period</span>
      </div>
    );
  }

  // Calculate SVG stroke dashes for donut segments
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const slices: (Slice & { strokeDasharray: string; strokeDashoffset: number })[] = data.map((item) => {
    const percentage = Math.round((item.amount / total) * 100);
    const dashLength = (percentage / 100) * circumference;
    const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percentage;

    return {
      id: item.categoryId,
      name: item.categoryName,
      value: item.amount,
      color: item.color,
      percentage,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-4">
      {/* Donut Graphic */}
      <div className="relative flex items-center justify-center">
        <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="14"
            fill="transparent"
          />
          {slices.map((slice) => (
            <circle
              key={slice.id}
              cx="50"
              cy="50"
              r={radius}
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              fill="transparent"
              strokeLinecap="round"
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </svg>

        {/* Center Total Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
          <span className="text-sm font-bold text-slate-100 font-mono">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {slices.map((slice) => (
          <div key={slice.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs text-slate-300 truncate font-medium">{slice.name}</span>
            </div>
            <div className="text-right pl-1 shrink-0">
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {slice.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
