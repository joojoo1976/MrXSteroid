'use client';

import React, { useState } from 'react';
import { recordSiteRotation } from '@/lib/tools/engines/tool-153-injection-site-rotator.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type SiteEntry = ReturnType<typeof recordSiteRotation>['entries'][number];

export default function Tool153SiteRotator() {
  const { locale } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [site, setSite] = useState('');
  const [records, setRecords] = useState<SiteEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const addRecord = () => {
    try {
      const result = recordSiteRotation({ entries: [{ site, usedOn: new Date().toISOString().slice(0, 10) }] });
      setRecords((current) => [...current, ...result.entries]);
      setError(null);
    } catch {
      setError(tr('أدخل اسماً وصفياً من حرف واحد إلى 80 حرفاً.', 'Enter a descriptive label of 1–80 characters.'));
    }
  };

  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل المواقع المدخل يدوياً', 'Injection Site Observation Log')}</h1>
    <p className="text-sm text-zinc-300">{tr('سجل وصفي فقط؛ لا يقدم تعليمات حقن أو تصريح أمان.', 'Descriptive log only; no injection instructions or safety clearance.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('تُعرض السجلات في هذه الصفحة فقط؛ لا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Records are held on this page only; they are not saved to your account or database and may disappear when you leave or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('اسم الموقع كما أدخلته', 'Site label as entered')}
      <input aria-label={tr('اسم الموقع كما أدخلته', 'Site label as entered')} maxLength={80} className="w-full rounded border bg-zinc-950 p-2 text-white" value={site} onChange={(event) => { setSite(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={addRecord}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {records.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')} className="space-y-2">
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{records.map((record, index) => <li key={`${record.usedOn}-${index}`} className="rounded border border-zinc-700 p-3">
        <p>{record.site}</p><p className="text-xs text-zinc-400">{record.usedOn} · {tr('مدخل من المستخدم', 'User-entered')}</p>
      </li>)}</ul>
    </section>}
  </main>;
}
