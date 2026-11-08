'use client';

import React from 'react';

export type DynamicState = 'empty' | 'partial' | 'full';

interface DynamicStateBadgeProps {
  state: DynamicState;
  locale?: 'ar' | 'en';
  missingFields?: string[];
  mvo?: string;
}

const LABELS: Record<DynamicState, { ar: string; en: string; color: string }> = {
  empty: { ar: 'فارغ', en: 'Empty', color: 'bg-zinc-700 text-zinc-200' },
  partial: { ar: 'جزئي', en: 'Partial', color: 'bg-yellow-900 text-yellow-200' },
  full: { ar: 'كامل', en: 'Full', color: 'bg-green-900 text-green-200' },
};

export function DynamicStateBadge({ state, locale = 'en', missingFields, mvo }: DynamicStateBadgeProps) {
  const isAr = locale === 'ar';
  const label = LABELS[state];
  return (
    <div className="flex items-center gap-2 text-xs" role="status" aria-live="polite">
      <span className={`px-2 py-0.5 rounded-full font-medium ${label.color}`}>
        {isAr ? label.ar : label.en}
      </span>
      {state === 'partial' && missingFields && missingFields.length > 0 && (
        <span className="text-zinc-400">
          {isAr ? `ناقص: ${missingFields.join(', ')}` : `Missing: ${missingFields.join(', ')}`}
        </span>
      )}
      {state === 'empty' && mvo && (
        <span className="text-zinc-400">
          {isAr ? `MVO: ${mvo}` : `MVO: ${mvo}`}
        </span>
      )}
    </div>
  );
}

export function computeDynamicState(
  requiredFields: string[],
  values: Record<string, unknown>
): { state: DynamicState; missing: string[] } {
  const missing = requiredFields.filter((f) => {
    const v = values[f];
    return v === undefined || v === null || v === '' || (typeof v === 'number' && !Number.isFinite(v));
  });
  if (missing.length === requiredFields.length) return { state: 'empty', missing };
  if (missing.length > 0) return { state: 'partial', missing };
  return { state: 'full', missing: [] };
}