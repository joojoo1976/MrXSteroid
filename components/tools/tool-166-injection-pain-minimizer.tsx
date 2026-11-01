'use client';

import React, { useState } from 'react';
import { recordPainNote } from '@/lib/tools/engines/tool-166-injection-pain.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool166() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const add = () => {
    try {
      const result = recordPainNote({ note });
      setNotes((current) => [...current, result.entry.note]);
      setError(null);
    } catch {
      setError(tr('أدخل ملاحظة من حرف واحد إلى 300 حرف.', 'Enter a note of 1–300 characters.'));
    }
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل ملاحظة الألم', 'Pain Observation Note')}</h1>
    <p className="text-sm text-zinc-300">{tr('ملاحظة يكتبها المستخدم فقط. لا يقدم علاجاً للألم أو تعليمات حقن أو تقييماً للسبب.', 'User-written note only. No pain treatment, injection instructions, or cause assessment is provided.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('الملاحظات ظاهرة في الصفحة الحالية فقط ولا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند المغادرة أو التحديث.', 'Notes are shown only on the current page. They are not saved to your account or database and may disappear on navigation or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('ملاحظة المستخدم', 'User note')}
      <textarea aria-label={tr('ملاحظة المستخدم', 'User note')} maxLength={300} className="w-full rounded border bg-zinc-950 p-2 text-white" value={note} onChange={(event) => { setNote(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={add}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {notes.length > 0 && <section aria-live="polite" aria-label={tr('الملاحظات الحالية', 'Current page notes')}><h2 className="font-bold">{tr('الملاحظات الحالية', 'Current page notes')}</h2><ul className="list-inside list-disc">{notes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>}
  </main>;
}
