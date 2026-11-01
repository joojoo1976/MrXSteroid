'use client';

import React, { useState } from 'react';
import { matchExplicitWarnings, WarningInputSchema } from '@/lib/tools/engines/tool-169-early-warning.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Signal = { id: number; label: string; selected: boolean };

export default function Tool169() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [signals, setSignals] = useState<Signal[]>([]);
  const [result, setResult] = useState<ReturnType<typeof matchExplicitWarnings> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const update = (id: number, patch: Partial<Signal>) => { setSignals((current) => current.map((signal) => signal.id === id ? { ...signal, ...patch } : signal)); setResult(null); setError(null); };
  const check = () => {
    const parsed = WarningInputSchema.safeParse({ signals: signals.map(({ label, selected }) => ({ label, selected })) });
    if (!parsed.success) { setResult(null); setError(tr('أكمل اسم كل إشارة ضمن 100 حرف، وبحد أقصى 50 إشارة.', 'Complete each signal label within 100 characters; at most 50 signals are allowed.')); return; }
    setResult(matchExplicitWarnings(parsed.data));
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل الإشارات التي تختارها', 'User-Selected Signal Checklist')}</h1>
    <p className="text-sm text-zinc-300">{tr('أدخل إشارات بنفسك وحدد صراحةً ما تريد إدراجه. لا توجد قائمة طبية مرجعية أو مطابقة ذكية أو تنبؤ أو تشخيص.', 'Enter signal labels yourself and explicitly select which to include. There is no medical reference list, intelligent matching, prediction, or diagnosis.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('هذه الأداة لا تحدد حالة آمنة ولا تستبعد الطوارئ. السجل يعكس اختياراتك فقط.', 'This tool does not establish safety or rule out an emergency. The list only reflects your selections.')}</p>
    <div className="space-y-3">
      {signals.map((signal, index) => <div key={signal.id} className="rounded border border-zinc-700 p-3">
        <label className="block space-y-1 text-sm">{tr('وصف الإشارة', 'Signal label')} {index + 1}
          <input aria-label={`${tr('وصف الإشارة', 'Signal label')} ${index + 1}`} maxLength={100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={signal.label} onChange={(event) => update(signal.id, { label: event.target.value })} />
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" aria-label={`${tr('حدد هذه الإشارة', 'Select this signal')} ${index + 1}`} checked={signal.selected} onChange={(event) => update(signal.id, { selected: event.target.checked })} />{tr('أدرجها باختياري', 'Include by my explicit choice')}</label>
        <button type="button" className="mt-2 text-xs text-red-300 underline" onClick={() => { setSignals((current) => current.filter((item) => item.id !== signal.id)); setResult(null); }}>{tr('إزالة', 'Remove')}</button>
      </div>)}
    </div>
    <button type="button" disabled={signals.length >= 50} className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50" onClick={() => { setSignals((current) => [...current, { id: Date.now() + current.length, label: '', selected: false }]); setResult(null); }}>{tr('أضف إشارة', 'Add signal')}</button>
    <button type="button" className="ms-2 rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={check}>{tr('اعرض الاختيارات الصريحة', 'Review explicit selections')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة قائمة الاختيار', 'Selection list result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{result.status === 'MATCH' ? tr('توجد تسميات اخترت إدراجها', 'One or more labels were explicitly selected') : tr('لم تختر أي تسمية للإدراج', 'No label was explicitly selected')}</h2>
      <p className="text-xs text-zinc-400">{tr('الحالة', 'Status')}: {result.status} · {tr('مطابقة اختيار صريح', 'Explicit-selection matching')}</p>
      {result.matched.length > 0 && <ul className="list-inside list-disc">{result.matched.map((label, index) => <li key={`${label}-${index}`}>{label}</li>)}</ul>}
      <p className="mt-2 text-sm text-amber-200">{tr('لا يتنبأ أو يشخّص أو يقيس الخطورة أو يثبت الأمان.', 'Does not predict, diagnose, measure risk, or establish safety.')}</p>
    </section>}
  </main>;
}
