'use client';

/**
 * components/tools/tool-049-bone-density-optimizer.tsx
 * Tool #049 — Bone Density Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessBoneHealth,
  recommendedCalcium,
  type BoneInput,
  type Sex,
} from '@/lib/tools/engines/tool-049-bone-density-optimizer';
import i18nJson from '@/i18n/tool-049-bone-density-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: BoneInput = {
  age: 45,
  sex: 'male',
  weight_kg: 85,
  calcium_intake_mg: 900,
  vitamin_d_ng_ml: 32,
  resistance_training_days: 3,
  smoker: false,
  androgen_exposure: true,
  prior_fracture: false,
  family_history_osteoporosis: false,
};

export default function Tool049BoneDensityOptimizer() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<BoneInput>(initial);
  const set = <K extends keyof BoneInput>(k: K, v: BoneInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessBoneHealth(input), [input]);
  const targetCalcium = recommendedCalcium(input.age, input.sex);

  const numField = (key: keyof BoneInput, label: string, min: number, max: number) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as BoneInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="bone-density-optimizer-tool p-6" dir={t.dir}>
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
        {numField('weight_kg', t.weight_kg, 35, 250)}
        {numField('calcium_intake_mg', `${t.calcium_intake_mg} (${t.target}: ${targetCalcium})`, 0, 4000)}
        {numField('vitamin_d_ng_ml', t.vitamin_d, 0, 120)}
        {numField('resistance_training_days', t.resistance_training_days, 0, 7)}
        {(['smoker', 'androgen_exposure', 'prior_fracture', 'family_history_osteoporosis'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.bone_health_index}</span><span dir="ltr" className="font-mono">{result.bone_health_index}</span></div>
        <div className="flex justify-between"><span>{t.risk_band}</span><strong>{t[result.risk_band] ?? result.risk_band}</strong></div>
      </div>

      {result.clinical_assessment_advised && (
        <div role="alert" className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">
          {t.clinical_assessment_notice}
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
