'use client';
import React, { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { NeuromuscularInputSchema, type NeuromuscularInput } from '@/lib/tools/schemas/tool-126-neuromuscular-explosiveness-modeler';
import type { NeuromuscularResult } from '@/lib/tools/engines/tool-126-neuromuscular-explosiveness-modeler.v6';
import { buildNeuromuscularOutput } from '@/lib/tools/adapters/tool-126-neuromuscular-explosiveness-modeler';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

const initial = { body_weight_kg: '', vertical_jump_cm: '', broad_jump_cm: '', sprint_10m_s: '', sprint_20m_s: '', one_rm_kg: '' };
type NeuromuscularForm = { [K in keyof typeof initial]: string };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const labelClass = 'block text-xs font-semibold text-zinc-300';
const asMetric = (value: string, units: 'metric' | 'imperial', kind: 'mass' | 'length') => value === '' ? undefined : Number(value) / (units === 'imperial' ? (kind === 'mass' ? 2.20462 : 2.54) : 1);
const shown = (value: string, units: 'metric' | 'imperial', kind: 'mass' | 'length') => value === '' ? '' : (Number(value) * (units === 'imperial' ? (kind === 'mass' ? 2.20462 : 1 / 2.54) : 1)).toFixed(1);

export default function Tool126Neuromuscular() {
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [form, setForm] = useState<NeuromuscularForm>(initial);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => NeuromuscularInputSchema.safeParse({
    body_weight_kg: form.body_weight_kg === '' ? undefined : Number(form.body_weight_kg),
    vertical_jump_cm: form.vertical_jump_cm === '' ? undefined : Number(form.vertical_jump_cm),
    broad_jump_cm: form.broad_jump_cm === '' ? undefined : Number(form.broad_jump_cm),
    sprint_10m_s: form.sprint_10m_s === '' ? undefined : Number(form.sprint_10m_s),
    sprint_20m_s: form.sprint_20m_s === '' ? undefined : Number(form.sprint_20m_s),
    one_rm_kg: form.one_rm_kg === '' ? undefined : Number(form.one_rm_kg),
  }), [form]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<NeuromuscularInput, NeuromuscularResult>(validInput);
  const unit = unitSystem === 'metric' ? 'kg' : 'lb';
  const lengthUnit = unitSystem === 'metric' ? 'cm' : 'in';
  const field = (key: keyof typeof initial, label: string, value: string, transform = (v: string) => v, type = 'number') => <label className={labelClass}>{label}<input className={inputClass} type={type} min={0} step="any" value={value} onChange={(e) => setForm((p) => ({ ...p, [key]: transform(e.target.value) }))} /></label>;

  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{t('الأداء العصبي العضلي والانفجارية', 'Neuromuscular Performance & Explosiveness')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{t('تقدير استدلالي من اختبارات مدخلة؛ لا يمثل معيار أداء معتمدًا.', 'A heuristic estimate from entered tests; not a validated performance standard.')}</p>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {field('body_weight_kg', `${t('وزن الجسم', 'Body weight')} (${unit})`, shown(form.body_weight_kg, unitSystem, 'mass'), (v) => v === '' ? '' : String(asMetric(v, unitSystem, 'mass')!))}
      {field('vertical_jump_cm', `${t('القفز العمودي', 'Vertical jump')} (${lengthUnit})`, shown(form.vertical_jump_cm, unitSystem, 'length'), (v) => v === '' ? '' : String(asMetric(v, unitSystem, 'length')!))}
      {field('broad_jump_cm', `${t('القفز العريض', 'Broad jump')} (${lengthUnit})`, shown(form.broad_jump_cm, unitSystem, 'length'), (v) => v === '' ? '' : String(asMetric(v, unitSystem, 'length')!))}
      {field('sprint_10m_s', t('زمن عدو 10 م (ث)', '10 m sprint (s)'), form.sprint_10m_s)}
      {field('sprint_20m_s', t('زمن عدو 20 م (ث)', '20 m sprint (s)'), form.sprint_20m_s)}
      {field('one_rm_kg', `${t('أقصى تكرار واحد', 'One-rep max')} (${unit})`, shown(form.one_rm_kg, unitSystem, 'mass'), (v) => v === '' ? '' : String(asMetric(v, unitSystem, 'mass')!))}
    </section>
    {!validInput && <p className="text-xs text-amber-300" role="alert">{t('أدخل وزن الجسم بقيمة موجبة. الاختبارات الأخرى اختيارية.', 'Enter a positive body weight. Other tests are optional.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildNeuromuscularOutput, locale, unitSystem)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('احسب', 'Calculate')}</button><button type="button" onClick={() => { reset(); setForm(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
