'use client';
/** Tool #120 - Progressive Overload & Adaptive Reserve Capacity Predictor (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type OverloadInput, type OverloadResult } from '@/lib/tools/engines/tool-120-progressive-overload-predictor';
import { buildOverloadOutput } from '@/lib/tools/adapters/tool-120-progressive-overload-predictor';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { OverloadInputSchema } from '@/lib/tools/schemas/tool-120-progressive-overload-predictor';
import i18nJson from '@/i18n/tool-120-progressive-overload-predictor.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-120-progressive-overload-predictor';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

interface DraftInputs {
  exercise: string;
  current_1rm_kg: number;
  current_volume_load_kg: number;
  current_frequency: number;
  baseline_1rm_kg: number;
  baseline_volume_load_kg: number;
  body_weight_kg: number;
  height_cm: number;
  age: number;
  sex: 'male' | 'female';
  training_age_years: number;
  weekly_load_increase_pct: number;
  deload_frequency_weeks: number;
  sleep_hours: number;
  protein_g_per_kg: number;
  wrist_cm: number;
  ankle_cm: number;
  days_since_deload: number;
}

export default function Tool120OverloadPredictor() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    exercise: 'Bench Press',
    current_1rm_kg: 100,
    current_volume_load_kg: 5000,
    current_frequency: 2,
    baseline_1rm_kg: 80,
    baseline_volume_load_kg: 3000,
    body_weight_kg: 80,
    height_cm: 178,
    age: 28,
    sex: 'male',
    training_age_years: 3,
    weekly_load_increase_pct: 2.5,
    deload_frequency_weeks: 6,
    sleep_hours: 8,
    protein_g_per_kg: 2,
    wrist_cm: 17,
    ankle_cm: 22,
    days_since_deload: 3,
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale, unitSystem]);

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const parsed = useMemo(() => OverloadInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as OverloadInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<OverloadInput, OverloadResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.exercise}
          <input type="text" maxLength={100} value={inputs.exercise} onChange={(e) => updateInput('exercise', e.target.value)} className={INP} placeholder={t.exercise_placeholder} />
        </label>
        <label className={LBL}>{t.current_1rm.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 1 : 2.2} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={unitSystem === 'metric' ? inputs.current_1rm_kg : Number((inputs.current_1rm_kg * 2.20462).toFixed(1))} onChange={(e) => updateInput('current_1rm_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 100 : 220.5)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
        </label>
        <label className={LBL}>{t.current_volume.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
          <input data-r6-slider="true" type="number" min={0} max={unitSystem === 'metric' ? 100000 : 220462} step={1} value={unitSystem === 'metric' ? inputs.current_volume_load_kg : Number((inputs.current_volume_load_kg * 2.20462).toFixed(0))} onChange={(e) => updateInput('current_volume_load_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 5000 : 11023)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
        </label>
        <label className={LBL}>{t.current_freq}
          <input data-r6-slider="true" type="number" min={1} max={7} step={1} value={inputs.current_frequency} onChange={(e) => updateInput('current_frequency', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.baseline_1rm.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 1 : 2.2} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={unitSystem === 'metric' ? inputs.baseline_1rm_kg : Number((inputs.baseline_1rm_kg * 2.20462).toFixed(1))} onChange={(e) => updateInput('baseline_1rm_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 80 : 176.4)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
        </label>
        <label className={LBL}>{t.baseline_volume.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
          <input data-r6-slider="true" type="number" min={0} max={unitSystem === 'metric' ? 100000 : 220462} step={1} value={unitSystem === 'metric' ? inputs.baseline_volume_load_kg : Number((inputs.baseline_volume_load_kg * 2.20462).toFixed(0))} onChange={(e) => updateInput('baseline_volume_load_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 3000 : 6614)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
        </label>
        <label className={LBL}>{t.body_weight.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 30 : 66} max={unitSystem === 'metric' ? 300 : 661} step={unitSystem === 'metric' ? 0.1 : 0.5} value={unitSystem === 'metric' ? inputs.body_weight_kg : Number((inputs.body_weight_kg * 2.20462).toFixed(1))} onChange={(e) => updateInput('body_weight_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 80 : 176.4)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
        </label>
        <label className={LBL}>{t.height.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'cm' : 'in'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 100 : 39.4} max={unitSystem === 'metric' ? 250 : 98.4} step={unitSystem === 'metric' ? 1 : 0.1} value={unitSystem === 'metric' ? inputs.height_cm : Number((inputs.height_cm / 2.54).toFixed(1))} onChange={(e) => updateInput('height_cm', Number((Number(e.target.value || (unitSystem === 'metric' ? 178 : 70.1)) * (unitSystem === 'metric' ? 1 : 2.54)).toFixed(2)))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={13} max={100} step={1} value={inputs.age} onChange={(e) => updateInput('age', Number(e.target.value || 28))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => updateInput('sex', e.target.value)} className={SEL}>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        <label className={LBL}>{t.training_age}
          <input data-r6-slider="true" type="number" min={0} max={30} step={1} value={inputs.training_age_years} onChange={(e) => updateInput('training_age_years', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.weekly_increase}
          <input data-r6-slider="true" type="number" min={0} max={20} step={0.1} value={inputs.weekly_load_increase_pct} onChange={(e) => updateInput('weekly_load_increase_pct', Number(e.target.value || 2.5))} className={INP} />
        </label>
        <label className={LBL}>{t.deload_freq}
          <input data-r6-slider="true" type="number" min={0} max={12} step={1} value={inputs.deload_frequency_weeks} onChange={(e) => updateInput('deload_frequency_weeks', Number(e.target.value || 6))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_hours}
          <input data-r6-slider="true" type="number" min={4} max={12} step={0.5} value={inputs.sleep_hours} onChange={(e) => updateInput('sleep_hours', Number(e.target.value || 8))} className={INP} />
        </label>
        <label className={LBL}>{t.protein_intake}
          <input data-r6-slider="true" type="number" min={0} max={5} step={0.1} value={inputs.protein_g_per_kg} onChange={(e) => updateInput('protein_g_per_kg', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.wrist_cm.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'cm' : 'in'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 10 : 3.9} max={unitSystem === 'metric' ? 25 : 9.8} step={unitSystem === 'metric' ? 0.1 : 0.05} value={unitSystem === 'metric' ? inputs.wrist_cm : Number((inputs.wrist_cm / 2.54).toFixed(2))} onChange={(e) => updateInput('wrist_cm', Number((Number(e.target.value || (unitSystem === 'metric' ? 17 : 6.7)) * (unitSystem === 'metric' ? 1 : 2.54)).toFixed(2)))} className={INP} />
        </label>
        <label className={LBL}>{t.ankle_cm.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'cm' : 'in'})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 10 : 3.9} max={unitSystem === 'metric' ? 30 : 11.8} step={unitSystem === 'metric' ? 0.1 : 0.05} value={unitSystem === 'metric' ? inputs.ankle_cm : Number((inputs.ankle_cm / 2.54).toFixed(2))} onChange={(e) => updateInput('ankle_cm', Number((Number(e.target.value || (unitSystem === 'metric' ? 22 : 8.7)) * (unitSystem === 'metric' ? 1 : 2.54)).toFixed(2)))} className={INP} />
        </label>
        <label className={LBL}>{t.days_since_deload}
          <input data-r6-slider="true" type="number" min={0} max={365} step={1} value={inputs.days_since_deload} onChange={(e) => updateInput('days_since_deload', Number(e.target.value || 3))} className={INP} />
        </label>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as OverloadInput, buildOverloadOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ exercise: 'Bench Press', current_1rm_kg: 100, current_volume_load_kg: 5000, current_frequency: 2, baseline_1rm_kg: 80, baseline_volume_load_kg: 3000, body_weight_kg: 80, height_cm: 178, age: 28, sex: 'male', training_age_years: 3, weekly_load_increase_pct: 2.5, deload_frequency_weeks: 6, sleep_hours: 8, protein_g_per_kg: 2, wrist_cm: 17, ankle_cm: 22, days_since_deload: 3 }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <Metric label={t.adaptive_reserve} value={`${result.adaptive_reserve_pct}%`} />
              <Metric label={t.genetic_potential} value={`${unitSystem === 'metric' ? result.genetic_potential_1rm_kg : Number((result.genetic_potential_1rm_kg * 2.20462).toFixed(1))} ${unitSystem === 'metric' ? 'kg' : 'lb'}`} />
              <Metric label={t.weeks_to_plateau} value={result.weeks_to_plateau >= 12 ? '12+' : `${result.weeks_to_plateau} w`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.projected_4w} value={`${unitSystem === 'metric' ? result.projected_1rm_4weeks : Number((result.projected_1rm_4weeks * 2.20462).toFixed(1))} ${unitSystem === 'metric' ? 'kg' : 'lb'}`} />
              <Metric label={t.projected_12w} value={`${unitSystem === 'metric' ? result.projected_1rm_12weeks : Number((result.projected_1rm_12weeks * 2.20462).toFixed(1))} ${unitSystem === 'metric' ? 'kg' : 'lb'}`} />
              <Metric label={t.recommended_increase} value={`${result.recommended_weekly_increase_pct}%/wk`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.trajectory}</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {result.overload_trajectory.map((p, i) => (
                <div key={i} className="flex justify-between text-[10px] px-2 py-1 rounded bg-zinc-950 border border-zinc-800">
                  <span className="font-bold text-lime-400">{t.week} {p.week}</span>
                  <span className="text-zinc-400">{unitSystem === 'metric' ? p.projected_1rm : Number((p.projected_1rm * 2.20462).toFixed(1))} {unitSystem === 'metric' ? 'kg' : 'lb'}</span>
                  <span className="text-zinc-500">{p.reserve_pct}% reserve</span>
                </div>
              ))}
            </div>

            {result.risk_factors.length > 0 && (
              <div className="mt-3 text-[11px] text-amber-300">
                <p className="font-black mb-1">{t.risk_factors}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.risk_factors.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}

            {result.flags.length > 0 && (
              <div className="mt-3 text-[11px] text-amber-300">
                <p className="font-black mb-1">{t.flags_title}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.flags.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">&#9888; {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}
