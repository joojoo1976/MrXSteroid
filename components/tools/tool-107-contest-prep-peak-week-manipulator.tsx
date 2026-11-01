'use client';
/** Tool #107 - Contest Prep Peak-Week Manipulator (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { buildPhaseTimeline, type ContestPrepResult } from '@/lib/tools/engines/tool-107-contest-prep-peak-week-manipulator';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { ContestPrepInputSchema } from '@/lib/tools/schemas/tool-107-contest-prep-peak-week-manipulator';
import i18nJson from '@/i18n/tool-107-contest-prep-peak-week-manipulator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-107-contest-prep-peak-week-manipulator';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const SEX_OPTIONS = ['male', 'female'];
const FORMAT_OPTIONS = ['bodybuilding', 'physique', 'figure', 'bikini'];
const HYDRATION_OPTIONS = ['normal', 'mild', 'severe'];
const TAN_OPTIONS = ['low', 'medium', 'high'];

interface DraftInputs {
  days_until_show: number;
  sex: string;
  weight_kg: number;
  hydration_status: string;
  tan_stability: string;
  show_stage_format: string;
}

export default function Tool107ContestPrep() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    days_until_show: 30,
    sex: 'male',
    weight_kg: 82,
    hydration_status: 'mild',
    tan_stability: 'medium',
    show_stage_format: 'physique',
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

  const isImperial = unitSystem === 'imperial';
  const displayWeight = (kg: number) => isImperial ? Number((kg * 2.2046226218).toFixed(1)) : kg;
  const canonicalWeight = (value: number) => isImperial ? value / 2.2046226218 : value;
  const displayWater = (liters: number) => isImperial ? Number((liters * 33.8140227).toFixed(1)) : liters;
  const weightUnit = isImperial ? 'lb' : 'kg';
  const waterUnit = isImperial ? 'fl oz' : 'L';

  const parsed = useMemo(() => ContestPrepInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<ContestPrepResult | null>(() => (parsed.success ? buildPhaseTimeline(parsed.data) : null), [parsed]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.days_left}
          <input type="number" min={1} max={90} step={1} value={inputs.days_until_show} onChange={(e) => setInputs((p) => ({ ...p, days_until_show: Number(e.target.value || 30) }))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value }))} className={SEL}>
            {SEX_OPTIONS.map((s) => (<option key={s} value={s}>{t[s === 'male' ? 'sex_male' : 'sex_female']}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.weight_kg.replace(/\s*\([^)]*\)\s*$/, '')} ({weightUnit})
          <input type="number" min={isImperial ? 88.2 : 40} max={isImperial ? 440.9 : 200} step={isImperial ? 0.1 : 1} value={displayWeight(inputs.weight_kg)} onChange={(e) => setInputs((p) => ({ ...p, weight_kg: canonicalWeight(Number(e.target.value || (isImperial ? 180.8 : 82))) }))} className={INP} />
        </label>
        <label className={LBL}>{t.hydration}
          <select value={inputs.hydration_status} onChange={(e) => setInputs((p) => ({ ...p, hydration_status: e.target.value }))} className={SEL}>
            {HYDRATION_OPTIONS.map((s) => (<option key={s} value={s}>{t[s + '_normal' === s ? 'hydr_normal' : s === 'mild' ? 'hydr_mild' : 'hydr_severe']}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.tan_stability}
          <select value={inputs.tan_stability} onChange={(e) => setInputs((p) => ({ ...p, tan_stability: e.target.value }))} className={SEL}>
            {TAN_OPTIONS.map((s) => (<option key={s} value={s}>{t[s + '_low' === s ? 'tan_low' : s === 'medium' ? 'tan_medium' : 'tan_high']}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.stage_format}
          <select value={inputs.show_stage_format} onChange={(e) => setInputs((p) => ({ ...p, show_stage_format: e.target.value }))} className={SEL}>
            {FORMAT_OPTIONS.map((s) => (<option key={s} value={s}>{t[s + '_bodybuilding' === s ? 'fmt_bodybuilding' : s === 'physique' ? 'fmt_physique' : s === 'figure' ? 'fmt_figure' : 'fmt_bikini']}</option>))}
          </select>
        </label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.phases}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-zinc-300">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="text-start py-1">{t.day}</th>
                    <th className="text-start py-1">{t.phase}</th>
                    <th className="text-start py-1">{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.phase_steps.map((s) => (
                    <tr key={`${s.days_before}-${s.phase}`} className="border-t border-zinc-800">
                      <td className="py-1 font-mono">{s.days_before}</td>
                      <td className="py-1 capitalize">{s.phase}</td>
                      <td className="py-1">{s.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="text-[9px] text-zinc-500">{t.sodium_ref}</div>
                <div className="font-mono text-lime-400">{result.sodium_ref_mg_day[0]} - {result.sodium_ref_mg_day[result.sodium_ref_mg_day.length - 1]} mg</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500">{t.water_ref}</div>
                <div className="font-mono text-lime-400">{displayWater(result.water_ref_liters[0])} - {displayWater(result.water_ref_liters[1])} {waterUnit}</div>
              </div>
            </div>
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

