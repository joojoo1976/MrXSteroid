'use client';

/**
 * components/tools/tool-047-fertility-preservation.tsx
 * Tool #047 — Fertility Preservation Guide (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import { assessFertility } from '@/lib/tools/engines/tool-047-fertility-preservation';
import i18nJson from '@/i18n/tool-047-fertility-preservation.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool047FertilityPreservation() {
  const t = useToolI18n(i18nJson);
  const [age, setAge] = useState(32);
  const [weeks, setWeeks] = useState(16);
  const [usedHcg, setUsedHcg] = useState(true);
  const [hasSperm, setHasSperm] = useState(false);
  const [concentration, setConcentration] = useState(20);
  const [motility, setMotility] = useState(45);

  const result = useMemo(
    () =>
      assessFertility({
        age,
        suppressive_weeks: weeks,
        used_hcg: usedHcg,
        sperm: hasSperm
          ? { concentration_million_ml: concentration, motility_pct: motility, morphology_pct: 4 }
          : null,
      }),
    [age, weeks, usedHcg, hasSperm, concentration, motility]
  );

  return (
    <div className="fertility-preservation-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.age}</span>
          <input type="number" dir="ltr" min={16} max={80} value={age}
            onChange={(e) => setAge(Number(e.target.value))} className="w-full rounded border p-2" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.suppressive_weeks}</span>
          <input type="number" dir="ltr" min={0} max={520} value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))} className="w-full rounded border p-2" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={usedHcg} onChange={(e) => setUsedHcg(e.target.checked)} />
          <span className="text-sm font-medium">{t.used_hcg}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hasSperm} onChange={(e) => setHasSperm(e.target.checked)} />
          <span className="text-sm font-medium">{t.has_semen_analysis}</span>
        </label>
        {hasSperm && (
          <>
            <label className="block">
              <span className="block text-sm font-medium mb-1">{t.concentration}</span>
              <input type="number" dir="ltr" min={0} max={400} value={concentration}
                onChange={(e) => setConcentration(Number(e.target.value))} className="w-full rounded border p-2" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-1">{t.motility}</span>
              <input type="number" dir="ltr" min={0} max={100} value={motility}
                onChange={(e) => setMotility(Number(e.target.value))} className="w-full rounded border p-2" />
            </label>
          </>
        )}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.likelihood}</span><strong>{t[result.likelihood] ?? result.likelihood}</strong></div>
        <div className="flex justify-between"><span>{t.likelihood_score}</span><span dir="ltr" className="font-mono">{result.likelihood_score}</span></div>
        <div className="flex justify-between"><span>{t.estimated_recovery_months}</span><span dir="ltr" className="font-mono">{result.estimated_recovery_months}</span></div>
      </div>

      {result.urgent_referral && (
        <div role="alert" className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-red-800 text-sm">
          {t.urgent_referral_notice}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.recommendations}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
