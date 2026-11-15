/**
 * components/tools/r6/R6Progress.tsx
 * Shared R6.1 progress line — rendered at the top and bottom of every tool
 * route. Server-safe (no hooks, no browser APIs).
 */
import React from 'react';

export interface R6ProgressProps {
  index: number;
  total: number;
  locale?: 'ar' | 'en';
}

export function R6Progress({ index, total, locale = 'en' }: R6ProgressProps) {
  const isAr = locale === 'ar';
  const safeTotal = total > 0 ? total : 1;
  const safeIndex = Math.min(Math.max(index, 0), safeTotal);
  const pct = Math.round((safeIndex / safeTotal) * 100);
  const label = isAr ? `الأداة ${safeIndex} من ${safeTotal}` : `Tool ${safeIndex} of ${safeTotal}`;

  return (
    <div data-r6-progress className="mb-4">
      <div className="mb-1 flex items-center justify-between text-[0.7rem] font-medium text-zinc-500 dark:text-zinc-400">
        <span>{isAr ? 'تقدم الأدوات' : 'Tool progress'}</span>
        <span className="tabular-nums" aria-hidden="true">
          {safeIndex}/{safeTotal}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeIndex}
        aria-valuetext={`${safeIndex}/${safeTotal}`}
      >
        <div
          className="h-full rounded-full bg-gold-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default R6Progress;
