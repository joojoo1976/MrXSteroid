'use client';

/**
 * R6CapabilityContract — honest 7-part capability disclosure + E-level chip.
 * Content comes from the pure phase2-manifest; no inference, no network.
 */
import React from 'react';
import type { Phase2Manifest } from '@/lib/tools/r6/phase2-manifest';

export function R6CapabilityContract({ manifest, locale = 'en' }: { manifest: Phase2Manifest; locale?: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const c = manifest.capability;
  const rows: Array<[string, string]> = [
    [isAr ? 'CAN' : 'CAN', c.can],
    [isAr ? 'CANNOT' : 'CANNOT', c.cannot],
    [isAr ? 'SOURCES' : 'SOURCES', c.sources],
    [isAr ? 'WHY' : 'WHY', c.why],
    [isAr ? 'COST' : 'COST', c.cost],
    [isAr ? 'STOP' : 'STOP', c.stop],
    [isAr ? 'RESTORE' : 'RESTORE', c.restore],
  ];
  return (
    <section data-r6-capability aria-label={isAr ? 'عقد القدرة' : 'Capability contract'} className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold">{isAr ? 'عقد القدرة' : 'Capability contract'}</h2>
        <span data-evidence={c.evidence} className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-200 dark:bg-zinc-700">
          {c.evidence}
        </span>
      </div>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-sm">
            <dt className="w-20 shrink-0 font-bold text-amber-700 dark:text-amber-400">{label}</dt>
            <dd className="text-zinc-700 dark:text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default R6CapabilityContract;
