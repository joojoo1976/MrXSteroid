'use client';

import React, { useState } from 'react';
import { recordPeptidePlan } from '@/lib/tools/engines/tool-161-peptide-protocol-planner.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Entry = ReturnType<typeof recordPeptidePlan>['entry'];

export default function Tool161() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const add = () => {
    try {
      const result = recordPeptidePlan({ name, note });
      setEntries((current) => [...current, result.entry]);
      setError(null);
    } catch {
      setError(tr('أدخل اسماً من 1 إلى 100 حرف، وملاحظة اختيارية لا تتجاوز 300 حرف.', 'Enter a name of 1–100 characters and an optional note up to 300 characters.'));
    }
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل ملاحظات الببتيدات', 'Peptide Note Record')}</h1>
    <p className="text-sm text-zinc-300">{tr('سجل ملاحظات المستخدم فقط؛ لا يقدم بروتوكولاً أو جرعة أو توقيتاً أو نصيحة علاجية.', 'User note record only; no protocol, dose, timing, or treatment advice.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('الملاحظات تبقى في حالة الصفحة الحالية فقط ولا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Notes remain only in the current page state. They are not saved to your account or database and may disappear on navigation or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('اسم وصفي (مطلوب)', 'Descriptive name (required)')}
      <input aria-label={tr('اسم وصفي (مطلوب)', 'Descriptive name (required)')} maxLength={100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={name} onChange={(event) => { setName(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('ملاحظة اختيارية', 'Optional note')}
      <textarea aria-label={tr('ملاحظة اختيارية', 'Optional note')} maxLength={300} className="w-full rounded border bg-zinc-950 p-2 text-white" value={note} onChange={(event) => { setNote(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={add}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {entries.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')}>
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{entries.map((entry, index) => <li key={`${entry.name}-${index}`} className="rounded border border-zinc-700 p-3"><strong>{entry.name}</strong>{entry.note && <p>{entry.note}</p>}<p className="text-xs text-zinc-400">{tr('محتوى أدخله المستخدم؛ بلا بروتوكول أو تحليل', 'User-entered content; no protocol or analysis')}</p></li>)}</ul>
    </section>}
  </main>;
}
