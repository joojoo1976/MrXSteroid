'use client';

import React, { useState } from 'react';
import { recordCompoundStack } from '@/lib/tools/engines/tool-154-compound-stack-builder.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type CompoundEntry = ReturnType<typeof recordCompoundStack>['entries'][number];

export default function Tool154CompoundRecord() {
  const { locale } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [compound, setCompound] = useState('');
  const [records, setRecords] = useState<CompoundEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const addRecord = () => {
    try {
      const result = recordCompoundStack({ entries: [{ compound, enteredByUser: true }] });
      setRecords((current) => [...current, ...result.entries]);
      setError(null);
    } catch {
      setError(tr('أدخل اسماً من حرف واحد إلى 100 حرف.', 'Enter a name of 1–100 characters.'));
    }
  };

  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل المركبات المدخلة', 'Compound Observation Record')}</h1>
    <p className="text-sm text-zinc-300">{tr('تسجيل ما يدخله المستخدم فقط؛ لا يبني بروتوكولاً ولا يقيّم التداخلات.', 'User record only; no protocol design or interaction evaluation.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('تُعرض السجلات في هذه الصفحة فقط؛ لا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Records are held on this page only; they are not saved to your account or database and may disappear when you leave or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('الاسم كما أدخله المستخدم', 'Name as entered by the user')}
      <input aria-label={tr('الاسم كما أدخله المستخدم', 'Name as entered by the user')} maxLength={100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={compound} onChange={(event) => { setCompound(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={addRecord}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {records.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')} className="space-y-2">
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{records.map((record, index) => <li key={`${record.compound}-${index}`} className="rounded border border-zinc-700 p-3">
        <p>{record.compound}</p><p className="text-xs text-zinc-400">{tr('مدخل من المستخدم؛ دون تحليل', 'User-entered; no analysis')}</p>
      </li>)}</ul>
    </section>}
  </main>;
}
