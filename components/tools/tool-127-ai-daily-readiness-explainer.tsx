'use client';
import React, { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { DailyReadinessInputSchema, type DailyReadinessInput } from '@/lib/tools/schemas/tool-127-ai-daily-readiness-explainer';
import type { DailyReadinessResult } from '@/lib/tools/engines/tool-127-ai-daily-readiness-explainer.v6';
import { buildReadinessOutput } from '@/lib/tools/adapters/tool-127-ai-daily-readiness-explainer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type Form = { sleep_hours: string; stress_level: string; soreness_level: string; previous_load: string; hydration: string };
const initial: Form = { sleep_hours: '', stress_level: '', soreness_level: '', previous_load: '', hydration: '' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool127DailyReadiness() {
  const { locale } = useToolDisplayPreferences();
  const [form, setForm] = useState<Form>(initial);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => DailyReadinessInputSchema.safeParse({
    sleep_hours: form.sleep_hours === '' ? undefined : Number(form.sleep_hours),
    stress_level: form.stress_level === '' ? undefined : Number(form.stress_level),
    soreness_level: form.soreness_level === '' ? undefined : Number(form.soreness_level),
    previous_load: form.previous_load === '' ? undefined : Number(form.previous_load),
    hydration: form.hydration === '' ? undefined : Number(form.hydration),
  }), [form]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<DailyReadinessInput, DailyReadinessResult>(validInput);
  const fields: Array<[keyof Form, string, string, string, number, number, number]> = [
    ['sleep_hours', t('النوم (ساعات)', 'Sleep (hours)'), 'number', 'any', 0, 24, 7],
    ['stress_level', t('مستوى الضغط (1–10)', 'Stress level (1–10)'), 'number', '1', 1, 10, 5],
    ['soreness_level', t('الألم العضلي (1–10)', 'Soreness (1–10)'), 'number', '1', 1, 10, 5],
    ['previous_load', t('الحمل السابق (اختياري)', 'Previous load (optional)'), 'number', 'any', 0, 100000, 0],
    ['hydration', t('الترطيب (0–100، اختياري)', 'Hydration (0–100, optional)'), 'number', '1', 0, 100, 50],
  ];
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{t('تقدير الجاهزية اليومية', 'Daily Readiness Estimate')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{t('حساب حتمي بقواعد مرجحة، وليس تفسيرًا بالذكاء الاصطناعي أو توجيهًا طبيًا.', 'Deterministic weighted rules, not an AI explanation or medical guidance.')}</p>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key, label, type, step, min, max, _fallback]) => <label key={key} className="text-xs font-semibold text-zinc-300">{label}<input type={type} min={min} max={max} step={step} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} className={inputClass} /></label>)}</section>
    {!validInput && <p role="alert" className="text-xs text-amber-300">{t('أدخل ساعات النوم والضغط والألم العضلي ضمن النطاقات المحددة.', 'Enter sleep, stress and soreness within the stated ranges.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildReadinessOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('احسب', 'Calculate')}</button><button type="button" onClick={() => { reset(); setForm(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
