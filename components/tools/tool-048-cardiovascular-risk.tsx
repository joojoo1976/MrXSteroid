'use client';

/**
 * components/tools/tool-048-cardiovascular-risk.tsx
 * Tool #048 — Cardiovascular Risk Assessor (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessCardiovascularRisk,
  type CardioInput,
  type Sex,
} from '@/lib/tools/engines/tool-048-cardiovascular-risk';
import i18nJson from '@/i18n/tool-048-cardiovascular-risk.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: CardioInput = {
  age: 40,
  sex: 'male',
  systolic_bp: 125,
  total_cholesterol_mg_dl: 190,
  hdl_mg_dl: 50,
  smoker: false,
  diabetic: false,
  on_antihypertensive: false,
  hematocrit_pct: 46,
  androgen_exposure: true,
  red_flags: {
    chest_pain: false,
    breathlessness_at_rest: false,
    syncope: false,
    unilateral_leg_swelling: false,
  },
};

export default function Tool048CardiovascularRisk() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<CardioInput>(initial);
  const set = <K extends keyof CardioInput>(k: K, v: CardioInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));
  const setFlag = (k: keyof CardioInput['red_flags'], v: boolean) =>
    setInput((p) => ({ ...p, red_flags: { ...p.red_flags, [k]: v } }));

  const result = useMemo(() => assessCardiovascularRisk(input), [input]);

  const numField = (
    key: keyof CardioInput,
    label: string,
    min: number,
    max: number
  ) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as CardioInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="cardiovascular-risk-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.sex}</span>
          <select dir="ltr" value={input.sex} onChange={(e) => set('sex', e.target.value as Sex)} className="w-full rounded border p-2">
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
        {numField('systolic_bp', t.systolic_bp, 70, 260)}
        {numField('total_cholesterol_mg_dl', t.total_cholesterol, 80, 500)}
        {numField('hdl_mg_dl', t.hdl, 10, 150)}
        {numField('hematocrit_pct', t.hematocrit, 25, 70)}
        {(['smoker', 'diabetic', 'on_antihypertensive', 'androgen_exposure'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <fieldset className="mt-4 border rounded p-3">
        <legend className="text-sm font-bold px-1">{t.red_flags}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(['chest_pain', 'breathlessness_at_rest', 'syncope', 'unilateral_leg_swelling'] as const).map((k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="checkbox" checked={input.red_flags[k]} onChange={(e) => setFlag(k, e.target.checked)} />
              <span className="text-sm">{t[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {result.emergency && (
        <div role="alert" className="mt-4 rounded border border-red-600 bg-red-50 p-3 text-red-800 text-sm font-bold">
          {result.emergency_message}
        </div>
      )}

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.risk_points}</span><span dir="ltr" className="font-mono">{result.risk_points}</span></div>
        <div className="flex justify-between"><span>{t.ten_year_risk_pct}</span><span dir="ltr" className="font-mono">{result.ten_year_risk_pct}</span></div>
        <div className="flex justify-between"><span>{t.risk_category}</span><strong>{t[result.risk_category] ?? result.risk_category}</strong></div>
      </div>

      {result.modifiable_factors.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">{t.modifiable_factors}</h3>
          <ul className="list-disc ps-6 text-sm space-y-1">
            {result.modifiable_factors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
