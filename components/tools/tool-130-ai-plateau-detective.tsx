'use client';
import React, { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { PlateauInputSchema, type PlateauInput } from '@/lib/tools/schemas/tool-130-ai-plateau-detective';
import type { PlateauResult } from '@/lib/tools/engines/tool-130-ai-plateau-detective.v6';
import { buildPlateauOutput } from '@/lib/tools/adapters/tool-130-ai-plateau-detective';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type PointDraft = { date: string; weight_kg: string; lift_1rm_kg: string; measurement: string };
const emptyPoint: PointDraft = { date: '', weight_kg: '', lift_1rm_kg: '', measurement: '' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const stored = (v: string, units: 'metric' | 'imperial') => v === '' ? undefined : Number(v) / (units === 'imperial' ? 2.20462 : 1);
const shown = (v: string, units: 'metric' | 'imperial') => v === '' ? '' : (Number(v) * (units === 'imperial' ? 2.20462 : 1)).toFixed(1);

export default function Tool130PlateauDetective() {
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [points, setPoints] = useState<PointDraft[]>([emptyPoint]);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => PlateauInputSchema.safeParse({ points: points.map((point) => ({
    date: point.date,
    weight_kg: point.weight_kg === '' ? undefined : Number(point.weight_kg),
    lift_1rm_kg: point.lift_1rm_kg === '' ? undefined : Number(point.lift_1rm_kg),
    measurement: point.measurement === '' ? undefined : Number(point.measurement),
  })) }), [points]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<PlateauInput, PlateauResult>(validInput);
  const update = (index: number, key: keyof PointDraft, value: string) => setPoints((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const massUnit = unitSystem === 'metric' ? 'kg' : 'lb';
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{t('مؤشر اتجاه التقدم (استدلالي)', 'Progress Trend Signal (Heuristic)')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{t('أدخل قياساتك المسجلة. الإشارة مبنية على قاعدة ميل ثابتة، وليست تحليل ذكاء اصطناعي أو ثقة إحصائية.', 'Enter your recorded measurements. The signal uses a fixed slope rule, not AI or statistical confidence.')}</p>
    <section className="space-y-3">{points.map((point, index) => <div key={index} className="grid gap-3 rounded-xl border border-zinc-800 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-xs text-zinc-300">{t('التاريخ', 'Date')}<input className={inputClass} type="date" value={point.date} onChange={(e) => update(index, 'date', e.target.value)} /></label>
      <label className="text-xs text-zinc-300">{t('وزن الجسم', 'Body weight')} ({massUnit})<input className={inputClass} type="number" min={0.1} step="any" value={shown(point.weight_kg, unitSystem)} onChange={(e) => update(index, 'weight_kg', e.target.value === '' ? '' : String(stored(e.target.value, unitSystem)))} /></label>
      <label className="text-xs text-zinc-300">{t('1RM المسجل', 'Recorded 1RM')} ({massUnit})<input className={inputClass} type="number" min={0.1} step="any" value={shown(point.lift_1rm_kg, unitSystem)} onChange={(e) => update(index, 'lift_1rm_kg', e.target.value === '' ? '' : String(stored(e.target.value, unitSystem)))} /></label>
      <div className="flex gap-2"><label className="flex-1 text-xs text-zinc-300">{t('قياس آخر (وحدة ثابتة)', 'Other measurement (consistent unit)')}<input className={inputClass} type="number" min={0.1} step="any" value={point.measurement} onChange={(e) => update(index, 'measurement', e.target.value)} /></label><button type="button" disabled={points.length === 1} onClick={() => setPoints((items) => items.filter((_, i) => i !== index))} className="self-end rounded border border-zinc-700 px-3 py-2 text-xs text-white disabled:opacity-40">{t('حذف', 'Remove')}</button></div>
    </div>)}</section>
    <button type="button" onClick={() => setPoints((items) => [...items, { ...emptyPoint }])} className="rounded border border-zinc-700 px-3 py-2 text-xs text-white">{t('إضافة نقطة قياس', 'Add data point')}</button>
    {!validInput && <p role="alert" className="text-xs text-amber-300">{t('أدخل تاريخًا ومقياسًا واحدًا على الأقل لكل نقطة.', 'Enter a date and at least one metric for every point.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildPlateauOutput, locale, unitSystem)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('حلل الاتجاه', 'Analyze trend')}</button><button type="button" onClick={() => { reset(); setPoints([{ ...emptyPoint }]); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
