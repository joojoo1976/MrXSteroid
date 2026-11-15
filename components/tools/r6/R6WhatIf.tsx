'use client';
import React from 'react';
import type { Phase2Manifest } from '@/lib/tools/r6/phase2-manifest';

export function R6WhatIf({ manifest, locale = 'en' }: { manifest: Phase2Manifest; locale?: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  return (
    <section data-whatif aria-label={isAr ? 'ماذا لو' : 'What-If'} className="mt-6">
      <h2 className="text-base font-semibold">{isAr ? 'ماذا لو (C8)' : 'What-If (C8)'}</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {isAr ? 'غير متاح (NOT_AVAILABLE): ' : 'NOT_AVAILABLE: '}
        {manifest.whatIf.naReason}
      </p>
    </section>
  );
}
export default R6WhatIf;
