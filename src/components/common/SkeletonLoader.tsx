import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number; type?: 'card' | 'line' | 'circle' }> = ({
  count = 3,
  type = 'card',
}) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4">
          {type === 'card' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-1/2 h-4 rounded-lg bg-slate-800 animate-shimmer" />
                <div className="w-14 h-4 rounded-full bg-slate-800 animate-shimmer" />
              </div>
              <div className="w-3/4 h-3 rounded-lg bg-slate-800/60 animate-shimmer" />
              <div className="w-full h-2 rounded-full bg-slate-800 animate-shimmer" />
            </div>
          )}
          {type === 'line' && (
            <div className="w-full h-4 rounded-lg bg-slate-800 animate-shimmer" />
          )}
        </div>
      ))}
    </div>
  );
};
