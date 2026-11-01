'use client';

import { useState } from 'react';
import { recordChemistryNote } from '@/lib/tools/engines/tool-246-homebrew-chemistry.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool246ChemistryObservationLog() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const record = () => {
    setError('');
    try {
      const result = recordChemistryNote({ note });
      setSavedNote(result.entry.note);
    } catch {
      setSavedNote('');
      setError(tr('أدخل ملاحظة من حرف واحد إلى 400 حرف.', 'Enter a note from 1 to 400 characters.'));
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('سجل ملاحظات الكيمياء', 'Chemistry Observation Log')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{tr('سجل نصاً يقدمه المستخدم فقط. لا ينفذ الأداة حساباً أو تحليلاً كيميائياً.', 'Records user-provided text only. This tool performs no chemistry calculation or analysis.')}</p>
      <label className="mt-4 grid gap-2 text-sm">{tr('الملاحظة', 'Observation')}
        <textarea aria-label={tr('الملاحظة', 'Observation')} maxLength={400} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-32 rounded border border-zinc-700 bg-zinc-950 p-3 text-white" />
      </label>
      <button type="button" onClick={record} className="mt-3 rounded bg-blue-600 px-4 py-2 font-bold text-white">{tr('سجل الملاحظة', 'Record note')}</button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {savedNote && <p role="status" className="mt-3 rounded border border-emerald-700 p-3">{tr('تم التحقق من الملاحظة وعرضها في الصفحة:', 'Validated note shown in this page:')} {savedNote}</p>}
      <p className="mt-4 text-xs text-zinc-500">{tr('لا تعليمات تصنيع أو خلط أو تسخين أو تنقية أو جرعات أو تحضير. لا تُحفظ الملاحظة بعد مغادرة الصفحة.', 'No synthesis, mixing, heating, purification, dose, or preparation instructions. The note is not saved after leaving the page.')}</p>
    </section>
  );
}
