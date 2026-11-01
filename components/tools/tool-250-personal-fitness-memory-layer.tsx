'use client';

import { useState } from 'react';
import { recordSessionMemory } from '@/lib/tools/engines/tool-250-memory-layer.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type SessionNote = { id: number; text: string };

export default function Tool250SessionOnlyFitnessNotes() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const addNote = () => {
    setError('');
    try {
      const result = recordSessionMemory({ entry: draft });
      if (notes.length >= 20) {
        setError(tr('الحد الأقصى 20 ملاحظة في الصفحة.', 'Limit is 20 notes on this page.'));
        return;
      }
      setNotes((current) => [...current, { id: current.length, text: result.entry.entry }]);
      setDraft('');
    } catch {
      setError(tr('أدخل ملاحظة من حرف واحد إلى 400 حرف.', 'Enter a note from 1 to 400 characters.'));
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('ملاحظات لياقة مؤقتة للجلسة', 'Session-Only Fitness Notes')}</h1>
      <p className="mt-2 rounded border border-amber-700/60 bg-amber-950/20 p-3 text-sm">{tr('تبقى الملاحظات في حالة الصفحة الحالية فقط. لا تستخدم قاعدة بيانات أو تخزين المتصفح أو مزامنة أو مشاركة بين الأدوات.', 'Notes remain only in this page state. No database, browser storage, synchronization, or cross-tool sharing is used.')}</p>
      <label className="mt-4 grid gap-2 text-sm">{tr('ملاحظة تختارها بنفسك', 'A note you choose')}
        <textarea aria-label={tr('ملاحظة تختارها بنفسك', 'A note you choose')} maxLength={400} value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-28 rounded border border-zinc-700 bg-zinc-950 p-3 text-white" />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={addNote} className="rounded bg-blue-600 px-4 py-2 font-bold text-white">{tr('أضف للجلسة فقط', 'Add to this session')}</button>
        <button type="button" onClick={() => { setNotes([]); setDraft(''); setError(''); }} className="rounded border border-zinc-600 px-4 py-2">{tr('امسح من الصفحة', 'Clear from page')}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      <ul aria-label={tr('ملاحظات الجلسة', 'Session notes')} className="mt-4 space-y-2">
        {notes.map((note, index) => <li key={note.id} className="rounded border border-zinc-700 p-3"><span className="me-2 text-xs text-zinc-500">{index + 1}.</span>{note.text}</li>)}
      </ul>
      <p role="status" className="mt-3 text-xs text-zinc-500">{tr(`${notes.length} ملاحظة مؤقتة في الصفحة`, `${notes.length} temporary notes on this page`)}</p>
    </section>
  );
}
