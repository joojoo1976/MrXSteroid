'use client';

/** components/tools/tool-055-insulin-sensitivity.tsx — Tool #055 (educational). */
import React, { useMemo, useState } from 'react';
import { assessInsulinSensitivity } from '@/lib/tools/engines/tool-055-insulin-sensitivity';
import i18nJson from '@/i18n/tool-055-insulin-sensitivity.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool055InsulinSensitivity() {
  const t = useToolI18n(i18nJson);
  const [glucose, setGlucose] = useState(95);
  const [insulin, setInsulin] = useState(7);
  const [activity, setActivity] = useState(3);
  const [sleep, setSleep] = useState(7);

  const result = useMemo(
    () => assessInsulinSensitivity({ fasting_glucose_mg_dl: glucose, fasting_insulin_uu_ml: insulin, activity_days_per_week: activity, sleep_hours: sleep }),
    [glucose, insulin, activity, sleep]
  );

  const num = (label: string, value: number, set: (n: number) => void, min: number, max: number, step = 1) => (
    <label className="block"><span className="block text-sm font-medium mb-1">{label}</span>
      <input type="number" dir="ltr" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full rounded border p-2" /></label>
  );

  return (
    <div className="insulin-sensitivity-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {num(t.fasting_glucose, glucose, setGlucose, 40, 400)}
        {num(t.fasting_insulin, insulin, setInsulin, 0.1, 300, 0.1)}
        {num(t.activity, activity, setActivity, 0, 7)}
        {num(t.sleep, sleep, setSleep, 0, 16, 0.5)}
      </div>
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.homa_ir}</span><span dir="ltr" className="font-mono">{result.homa_ir}</span></div>
        <div className="flex justify-between"><span>{t.quicki}</span><span dir="ltr" className="font-mono">{result.quicki}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>
      <ul className="mt-4 list-disc ps-6 text-sm space-y-1">{result.recommendations.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
