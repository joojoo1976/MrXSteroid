'use client';
import React from 'react';
import type { Phase2Manifest } from '@/lib/tools/r6/phase2-manifest';

export function R6PieChart({ manifest, locale = 'en' }: { manifest: Phase2Manifest; locale?: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  if (manifest.chart.kind !== 'pie3') {
    return (
      <section data-chart="none" aria-label={isAr ? 'رسم توضيحي' : 'Chart'} className="mt-6">
        <h2 className="text-base font-semibold">{isAr ? 'رسم توضيحي' : 'Visualization'}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {isAr ? 'غير منطبق (NOT_APPLICABLE): ' : 'NOT_APPLICABLE: '}
          {manifest.chart.naReason}
        </p>
      </section>
    );
  }
  return (
    <section data-chart="pie3" aria-label={isAr ? 'رسم دائري' : 'Pie chart'} className="mt-6">
      <h2 className="text-base font-semibold">{isAr ? 'رسم دائري 3 شرائح' : '3-segment pie'}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {isAr ? 'لا توجد نسبة مثبتة بعد — لا يُعرض رسم زخرفي.' : 'No verified 3-segment proportions yet — no decorative pie is shown.'}
      </p>
    </section>
  );
}
export default R6PieChart;
