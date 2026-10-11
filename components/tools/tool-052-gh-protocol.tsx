'use client';

/** components/tools/tool-052-gh-protocol.tsx — Tool #052 (educational). */
import React, { useMemo, useState } from 'react';
import { planGhProtocol } from '@/lib/tools/engines/tool-052-gh-protocol';
import i18nJson from '@/i18n/tool-052-gh-protocol.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool052GhProtocol() {
  const t = useToolI18n(i18nJson);
  const [weeklyIu, setWeeklyIu] = useState(7);
  const [perWeek, setPerWeek] = useState(7);
  const [age, setAge] = useState(30);
  const [igf1, setIgf1] = useState(180);
  const [glucose, setGlucose] = useState(90);

  const result = useMemo(
    () => planGhProtocol({ weekly_iu: weeklyIu, injections_per_week: perWeek, age, baseline_igf1_ng_ml: igf1, fasting_glucose_mg_dl: glucose, hypothyroid: false }),
    [weeklyIu, perWeek, age, igf1, glucose]
  );

  const num = (label: string, value: number, set: (n: number) => void, min: number, max: number, step = 1) => (
    <label className="block"><span className="block text-sm font-medium mb-1">{label}</span>
      <input type="number" dir="ltr" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full rounded border p-2" /></label>
  );

  return (
    <div className="gh-protocol-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {num(t.weekly_iu, weeklyIu, setWeeklyIu, 0, 200)}
        {num(t.injections_per_week, perWeek, setPerWeek, 1, 21)}
        {num(t.age, age, setAge, 16, 90)}
        {num(t.baseline_igf1, igf1, setIgf1, 20, 600)}
        {num(t.fasting_glucose, glucose, setGlucose, 50, 400)}
      </div>
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.per_injection_iu}</span><span dir="ltr" className="font-mono">{result.per_injection_iu}</span></div>
        <div className="flex justify-between"><span>{t.igf1_response_index}</span><span dir="ltr" className="font-mono">{result.igf1_response_index}</span></div>
        <div className="flex justify-between"><span>{t.projected_igf1}</span><span dir="ltr" className="font-mono">{result.projected_igf1_ng_ml}</span></div>
        <div className="flex justify-between"><span>{t.glucose_risk}</span><strong>{t[result.glucose_risk] ?? result.glucose_risk}</strong></div>
      </div>
      <ul className="mt-4 list-disc ps-6 text-sm space-y-1">{result.safety_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
