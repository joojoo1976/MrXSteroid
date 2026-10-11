'use client';

/**
 * components/tools/tool-058-androgenic-balance.tsx
 * Tool #058 — Androgenic Balance Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessAndrogenicBalance,
  type AndrogenicBalanceInput,
} from '@/lib/tools/engines/tool-058-androgenic-balance';
import i18nJson from '@/i18n/tool-058-androgenic-balance.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: AndrogenicBalanceInput = {
  anabolic_activity: 60,
  androgenic_activity: 60,
  androgenic_side_effects: 0,
  mpb_history: false,
  acne_severity: 0,
};

export default function Tool058AndrogenicBalance() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<AndrogenicBalanceInput>(initial);
  const set = <K extends keyof AndrogenicBalanceInput>(k: K, v: AndrogenicBalanceInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessAndrogenicBalance(input), [input]);

  const numField = (key: keyof AndrogenicBalanceInput, label: string, min: number, max: number) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as AndrogenicBalanceInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="androgenic-balance-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('anabolic_activity', t.anabolic_activity, 1, 100)}
        {numField('androgenic_activity', t.androgenic_activity, 1, 100)}
        {numField('androgenic_side_effects', t.androgenic_side_effects, 0, 3)}
        {numField('acne_severity', t.acne_severity, 0, 3)}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.mpb_history} onChange={(e) => set('mpb_history', e.target.checked)} />
          <span className="text-sm font-medium">{t.mpb_history}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.ratio}</span><span dir="ltr" className="font-mono">{result.anabolic_androgenic_ratio}</span></div>
        <div className="flex justify-between"><span>{t.dissociation_index}</span><span dir="ltr" className="font-mono">{result.dissociation_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
        <div className="flex justify-between"><span>{t.side_effect_burden}</span><strong>{t[result.side_effect_burden] ?? result.side_effect_burden}</strong></div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.contributing_factors}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.education}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.education.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
