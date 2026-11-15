'use client';
import { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { TransformationScenarioSchema, type TransformationScenarioInput } from '@/lib/tools/schemas/tool-131-transformation-forecast-trajectory-engine';
import type { TransformationScenarioResult } from '@/lib/tools/engines/tool-131-transformation-forecast-trajectory-engine.v6';
import { buildTransformationScenarioOutput } from '@/lib/tools/adapters/tool-131-transformation-forecast-trajectory-engine';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type Draft = { current_weight_kg: string; current_body_fat_pct: string; target_body_fat_pct: string; weekly_weight_change_kg: string };
const blank: Draft = { current_weight_kg: '', current_body_fat_pct: '', target_body_fat_pct: '', weekly_weight_change_kg: '' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
export default function Tool131TransformationScenario() {
  const { locale, unitSystem: unit } = useToolDisplayPreferences();

  const [draft, setDraft] = useState<Draft>(blank);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => TransformationScenarioSchema.safeParse(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value === '' ? undefined : Number(value)]))), [draft]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<TransformationScenarioInput, TransformationScenarioResult>(input);
  const mass = unit === 'metric' ? 'kg' : 'lb';
  const setMass = (key: 'current_weight_kg' | 'weekly_weight_change_kg', value: string) => setDraft((old) => ({ ...old, [key]: value === '' ? '' : String(Number(value) / (unit === 'imperial' ? 2.20462 : 1)) }));
  const shownMass = (value: string) => value === '' ? '' : (Number(value) * (unit === 'imperial' ? 2.20462 : 1)).toFixed(1);
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('سيناريو مسار التحول الجسدي', 'Body Transformation Scenario')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{tr('حساب سيناريو ثابت الكتلة الخالية من الدهون وبالمعدل الذي تختاره. ليس تنبؤًا فعليًا أو خطة طبية.', 'A constant-lean-mass scenario at your selected rate. This is not an actual prediction or medical plan.')}</p>
    <section className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-zinc-300">{tr('الوزن الحالي', 'Current weight')} ({mass})<input aria-label={tr('الوزن الحالي', 'Current weight')} type="number" min="1" step="any" value={shownMass(draft.current_weight_kg)} onChange={(e) => setMass('current_weight_kg', e.target.value)} className={inputClass} /></label>
      <label className="text-xs text-zinc-300">{tr('نسبة الدهون الحالية (%)', 'Current body fat (%)')}<input data-r6-slider="true" aria-label={tr('نسبة الدهون الحالية (%)', 'Current body fat (%)')} type="number" min="3" max="70" step="any" value={draft.current_body_fat_pct} onChange={(e) => setDraft((old) => ({ ...old, current_body_fat_pct: e.target.value }))} className={inputClass} /></label>
      <label className="text-xs text-zinc-300">{tr('نسبة الدهون المستهدفة (%)', 'Target body fat (%)')}<input data-r6-slider="true" aria-label={tr('نسبة الدهون المستهدفة (%)', 'Target body fat (%)')} type="number" min="3" max="70" step="any" value={draft.target_body_fat_pct} onChange={(e) => setDraft((old) => ({ ...old, target_body_fat_pct: e.target.value }))} className={inputClass} /></label>
      <label className="text-xs text-zinc-300">{tr('معدل التغير الأسبوعي الذي تختاره', 'Your selected weekly change rate')} ({mass}/week)<input data-r6-slider="true" aria-label={tr('معدل التغير الأسبوعي الذي تختاره', 'Your selected weekly change rate')} type="number" min="0.1" max={unit === 'metric' ? 2 : 4.4} step="any" value={shownMass(draft.weekly_weight_change_kg)} onChange={(e) => setMass('weekly_weight_change_kg', e.target.value)} className={inputClass} /></label>
    </section>
    {!input && <p role="alert" className="text-xs text-amber-300">{tr('أدخل الوزن والنسب ومعدلًا أسبوعيًا ضمن الحدود.', 'Enter weight, percentages and a weekly rate within the stated bounds.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildTransformationScenarioOutput, locale, unit)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('احسب السيناريو', 'Calculate scenario')}</button><button type="button" onClick={() => { reset(); setDraft(blank); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
