'use client';

import React, { useState } from 'react';
import { recordSideEffects, type SideEffectLogInput } from '@/lib/tools/engines/tool-152-side-effect-tracker.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool152SideEffectTracker() {
  const { locale } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [symptom, setSymptom] = useState('');
  const [note, setNote] = useState('');
  const [records, setRecords] = useState<SideEffectLogInput['entries']>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const addRecord = () => {
    try {
      const result = recordSideEffects({ entries: [{ symptom, observedAt: new Date().toISOString().slice(0, 10), severity: 'user_noted', note }] });
      setRecords((current) => [...current, ...result.entries]);
      setError(null);
    } catch {
      setError(tr('أدخل ملاحظة من حرف واحد إلى 120 حرفاً، واجعل التفاصيل الاختيارية ضمن 300 حرف.', 'Enter an observation of 1–120 characters; optional details must be at most 300 characters.'));
    }
  };

  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل الملاحظات الجسدية', 'Side-Effect Observation Log')}</h1>
    <p className="text-sm text-zinc-300">{tr('تسجيل يدوي فقط، دون تشخيص أو استنتاج خطورة.', 'Manual user log only; no diagnosis or severity inference.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('تُعرض السجلات في هذه الصفحة فقط؛ لا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Records are held on this page only; they are not saved to your account or database and may disappear when you leave or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('الملاحظة (مطلوبة)', 'Observation (required)')}
      <input aria-label={tr('الملاحظة (مطلوبة)', 'Observation (required)')} maxLength={120} className="w-full rounded border bg-zinc-950 p-2 text-white" value={symptom} onChange={(event) => { setSymptom(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('تفاصيل اختيارية', 'Optional details')}
      <textarea aria-label={tr('تفاصيل اختيارية', 'Optional details')} maxLength={300} className="w-full rounded border bg-zinc-950 p-2 text-white" value={note} onChange={(event) => { setNote(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={addRecord}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {records.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')} className="space-y-2">
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{records.map((record, index) => <li key={`${record.observedAt}-${index}`} className="rounded border border-zinc-700 p-3">
        <p>{record.symptom}</p><p className="text-xs text-zinc-400">{record.observedAt} · {tr('مدخل من المستخدم', 'User-entered')}</p>{record.note && <p className="text-sm text-zinc-300">{record.note}</p>}
      </li>)}</ul>
    </section>}
  </main>;
}
