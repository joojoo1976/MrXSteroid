'use client';

/** components/tools/tool-056-mini-pct.tsx — Tool #056 (educational timing). */
import React, { useMemo, useState } from 'react';
import { planMiniPct } from '@/lib/tools/engines/tool-056-mini-pct';
import i18nJson from '@/i18n/tool-056-mini-pct.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool056MiniPct() {
  const t = useToolI18n(i18nJson);
  const [lastInjection, setLastInjection] = useState('2026-01-01');
  const [halfLife, setHalfLife] = useState(5);
  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [age, setAge] = useState(30);
  const [usedHcg, setUsedHcg] = useState(true);

  const result = useMemo(
    () => planMiniPct({ last_injection_iso: `${lastInjection}T00:00:00Z`, longest_half_life_days: halfLife, cycle_weeks: cycleWeeks, age, used_hcg: usedHcg }),
    [lastInjection, halfLife, cycleWeeks, age, usedHcg]
  );

  return (
    <div className="mini-pct-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block"><span className="block text-sm font-medium mb-1">{t.last_injection}</span>
          <input type="date" dir="ltr" value={lastInjection} onChange={(e) => setLastInjection(e.target.value)} className="w-full rounded border p-2" /></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.half_life}</span>
          <input type="number" dir="ltr" min={0.2} max={60} step={0.1} value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.cycle_weeks}</span>
          <input type="number" dir="ltr" min={1} max={52} value={cycleWeeks} onChange={(e) => setCycleWeeks(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.age}</span>
          <input type="number" dir="ltr" min={16} max={90} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={usedHcg} onChange={(e) => setUsedHcg(e.target.checked)} />
          <span className="text-sm font-medium">{t.used_hcg}</span>
        </label>
      </div>
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.washout_days}</span><span dir="ltr" className="font-mono">{result.washout_days}</span></div>
        <div className="flex justify-between"><span>{t.pct_window}</span><span dir="ltr" className="font-mono">{result.pct_start_earliest_iso} → {result.pct_start_latest_iso}</span></div>
      </div>
      <ul className="mt-4 list-disc ps-6 text-sm space-y-1">{result.safety_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
