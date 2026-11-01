'use client';
import React, { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { AcwrInputSchema, type AcwrInput } from '@/lib/tools/schemas/tool-128-training-load-acute-chronic-ratio';
import type { AcwrResult } from '@/lib/tools/engines/tool-128-training-load-acute-chronic-ratio.v6';
import { buildAcwrOutput } from '@/lib/tools/adapters/tool-128-training-load-acute-chronic-ratio';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type SessionDraft = { date: string; load: string };
const initial: SessionDraft[] = [{ date: '', load: '' }];
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool128Acwr() {
  const { locale } = useToolDisplayPreferences();
  const [sessions, setSessions] = useState<SessionDraft[]>(initial);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => AcwrInputSchema.safeParse({ sessions: sessions.map((session) => ({ date: session.date, load: session.load === '' ? undefined : Number(session.load) })) }), [sessions]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<AcwrInput, AcwrResult>(validInput);
  const update = (index: number, key: keyof SessionDraft, value: string) => setSessions((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{t('مؤشر الحمل التدريبي الحاد والتراكمي', 'Acute-to-Chronic Training Load Indicator')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{t('أدخل جلسات مسجلة فعلية. لا تُنشأ بيانات تدريب افتراضية. المؤشر ليس تنبؤًا بالإصابة.', 'Enter actual logged sessions. No sample training data is generated. This is not an injury prediction.')}</p>
    <section className="space-y-2">{sessions.map((session, index) => <div key={index} className="grid gap-3 rounded-xl border border-zinc-800 p-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="text-xs text-zinc-300">{t('تاريخ الجلسة', 'Session date')}<input type="date" value={session.date} onChange={(e) => update(index, 'date', e.target.value)} className={inputClass} /></label>
      <label className="text-xs text-zinc-300">{t('حمل الجلسة (وحدة متسقة تختارها)', 'Session load (use one consistent scale)')}<input type="number" min={0} step="any" value={session.load} onChange={(e) => update(index, 'load', e.target.value)} className={inputClass} /></label>
      <button type="button" disabled={sessions.length === 1} onClick={() => setSessions((items) => items.filter((_, i) => i !== index))} className="self-end rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-200 disabled:opacity-40">{t('حذف', 'Remove')}</button>
    </div>)}</section>
    <button type="button" onClick={() => setSessions((items) => [...items, { date: '', load: '' }])} className="rounded border border-zinc-700 px-3 py-2 text-xs text-white">{t('إضافة جلسة', 'Add session')}</button>
    {!validInput && <p role="alert" className="text-xs text-amber-300">{t('أدخل تاريخًا وحملًا صالحين لكل جلسة.', 'Enter a valid date and load for each session.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildAcwrOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('احسب', 'Calculate')}</button><button type="button" onClick={() => { reset(); setSessions(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
