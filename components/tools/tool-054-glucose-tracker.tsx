'use client';

/** components/tools/tool-054-glucose-tracker.tsx — Tool #054 (educational). */
import React, { useMemo, useState } from 'react';
import { analyzeGlucose } from '@/lib/tools/engines/tool-054-glucose-tracker';
import i18nJson from '@/i18n/tool-054-glucose-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool054GlucoseTracker() {
  const t = useToolI18n(i18nJson);
  const [csv, setCsv] = useState('100, 120, 145, 210, 95');

  const readings = useMemo(
    () =>
      csv
        .split(/[,\s]+/)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0)
        .map((value, i) => ({ value, at: `2026-01-01T00:${String(i).padStart(2, '0')}:00Z` })),
    [csv]
  );

  const result = useMemo(() => analyzeGlucose({ readings }), [readings]);

  return (
    <div className="glucose-tracker-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <label className="block">
        <span className="block text-sm font-medium mb-1">{t.readings_csv}</span>
        <textarea dir="ltr" value={csv} onChange={(e) => setCsv(e.target.value)} rows={3} className="w-full rounded border p-2" />
      </label>

      {result.emergency && (
        <div role="alert" className="mt-4 rounded border-2 border-red-600 bg-red-50 p-3 text-red-800 text-sm font-bold">{result.emergency_message}</div>
      )}

      <div className="mt-6 rounded border p-4 grid grid-cols-2 gap-2">
        <div className="flex justify-between"><span>{t.count}</span><span dir="ltr" className="font-mono">{result.count}</span></div>
        <div className="flex justify-between"><span>{t.mean}</span><span dir="ltr" className="font-mono">{result.mean_mg_dl}</span></div>
        <div className="flex justify-between"><span>{t.min}</span><span dir="ltr" className="font-mono">{result.min_mg_dl}</span></div>
        <div className="flex justify-between"><span>{t.max}</span><span dir="ltr" className="font-mono">{result.max_mg_dl}</span></div>
        <div className="flex justify-between"><span>{t.tir}</span><span dir="ltr" className="font-mono">{result.time_in_range_pct}%</span></div>
        <div className="flex justify-between"><span>{t.est_a1c}</span><span dir="ltr" className="font-mono">{result.estimated_a1c_pct}%</span></div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
