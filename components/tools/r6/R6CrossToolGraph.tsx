'use client';
import React from 'react';
import type { R6ManifestEntry } from '@/lib/tools/r6/manifest';
import type { Phase2Manifest } from '@/lib/tools/r6/phase2-manifest';

export function R6CrossToolGraph({ entry, manifest, locale = 'en' }: { entry: R6ManifestEntry; manifest: Phase2Manifest; locale?: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  if (!manifest.crossTool.applicable) {
    return (
      <section data-crosstool="na" className="mt-6">
        <p className="text-sm text-zinc-500">{manifest.crossTool.naReason}</p>
      </section>
    );
  }
  const prev = entry.prevSlug ? (isAr ? entry.prevTitleAr : entry.prevTitleEn) ?? entry.prevSlug : null;
  const next = entry.nextSlug ? (isAr ? entry.nextTitleAr : entry.nextTitleEn) ?? entry.nextSlug : null;
  return (
    <section data-crosstool="ready" aria-label={isAr ? 'أدوات مرتبطة' : 'Related tools'} className="mt-6">
      <h2 className="text-base font-semibold">{isAr ? 'أدوات مرتبطة' : 'Related tools'}</h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        {prev && <li>{isAr ? 'السابق: ' : 'Previous: '}{prev}</li>}
        {next && <li>{isAr ? 'التالي: ' : 'Next: '}{next}</li>}
      </ul>
      <p className="mt-1 text-xs text-zinc-500">
        {isAr ? 'الحداثة: أدوات مرتبطة غير مؤقتة بعد.' : 'Freshness: related tools are not yet time-boxed.'}
      </p>
    </section>
  );
}
export default R6CrossToolGraph;
