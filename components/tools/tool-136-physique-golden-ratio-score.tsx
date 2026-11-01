'use client';
import { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { PhysiqueInputSchema, type PhysiqueInput } from '@/lib/tools/schemas/tool-136-physique-golden-ratio-score';
import type { PhysiqueResult } from '@/lib/tools/engines/tool-136-physique-golden-ratio-score.v6';
import { buildPhysiqueOutput } from '@/lib/tools/adapters/tool-136-physique-golden-ratio-score';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type Draft = Record<keyof PhysiqueInput, string>;
const blank: Draft = { shoulder_cm: '', chest_cm: '', waist_cm: '', hips_cm: '', arm_cm: '', thigh_cm: '', calf_cm: '' };
const fields: Array<[keyof PhysiqueInput, string, string]> = [['shoulder_cm','محيط الكتفين','Shoulder circumference'],['chest_cm','محيط الصدر','Chest circumference'],['waist_cm','محيط الخصر','Waist circumference'],['hips_cm','محيط الوركين','Hip circumference'],['arm_cm','محيط الذراع','Arm circumference'],['thigh_cm','محيط الفخذ','Thigh circumference'],['calf_cm','محيط الساق','Calf circumference']];
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
export default function Tool136PhysiqueProportion() {
  const { locale, unitSystem: unit } = useToolDisplayPreferences();

  const [draft, setDraft] = useState<Draft>(blank);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => PhysiqueInputSchema.safeParse(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value === '' ? undefined : Number(value)]))), [draft]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<PhysiqueInput, PhysiqueResult>(input);
  const lengthUnit = unit === 'metric' ? 'cm' : 'in';
  const display = (v: string) => v === '' ? '' : (Number(v) / (unit === 'imperial' ? 2.54 : 1)).toFixed(1);
  const update = (key: keyof PhysiqueInput, value: string) => setDraft((old) => ({ ...old, [key]: value === '' ? '' : String(Number(value) * (unit === 'imperial' ? 2.54 : 1)) }));
  const hasComparablePair = Boolean(draft.waist_cm && (draft.shoulder_cm || draft.chest_cm || draft.arm_cm));
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('مقارنة نسب محيطات القوام', 'Physique Circumference Ratio Comparison')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{tr('المؤشر تجميلي واستدلالي باستخدام نسب ثابتة غير معتمدة صحيًا. أدخل القياسات التي تريد مقارنة نسبها؛ لا تُستبدل القياسات الناقصة بأصفار.', 'This is an unvalidated aesthetic heuristic using fixed ratios. Enter measurements whose ratios you want compared; missing values are not replaced with zeros.')}</p>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, ar, en]) => <label className="text-xs text-zinc-300" key={key}>{tr(ar,en)} ({lengthUnit})<input aria-label={`${tr(ar,en)} (${lengthUnit})`} className={inputClass} type="number" min="0.1" max={unit === 'metric' ? 300 : 118} step="any" value={display(draft[key])} onChange={(e) => update(key, e.target.value)} /></label>)}</section>
    {!hasComparablePair && <p role="alert" className="text-xs text-amber-300">{tr('لإظهار مؤشر النسب، أدخل الخصر وقياسًا واحدًا على الأقل من الكتف أو الصدر أو الذراع.', 'For a ratio indicator, enter waist plus at least one shoulder, chest or arm measurement.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildPhysiqueOutput, locale, unit)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('احسب النسب', 'Calculate ratios')}</button><button type="button" onClick={() => { reset(); setDraft(blank); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
