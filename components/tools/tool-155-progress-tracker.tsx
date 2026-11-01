'use client';

import React, { useState } from 'react';
import { recordProgress } from '@/lib/tools/engines/tool-155-progress-tracker.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type ProgressEntry = ReturnType<typeof recordProgress>['entries'][number];

export default function Tool155ProgressTracker() {
  const { locale } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [metric, setMetric] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [records, setRecords] = useState<ProgressEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const addRecord = () => {
    try {
      const result = recordProgress({ entries: [{ recordedOn: new Date().toISOString().slice(0, 10), metric, value: value.trim() === '' ? Number.NaN : Number(value), unit }] });
      setRecords((current) => [...current, ...result.entries]);
      setError(null);
    } catch {
      setError(tr('أدخل اسماً للقياس من حرف واحد إلى 80 حرفاً، وقيمة رقمية محدودة.', 'Enter a metric name of 1–80 characters and a finite numeric value within range.'));
    }
  };

  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل ملاحظات التقدم', 'Progress Observation Log')}</h1>
    <p className="text-sm text-zinc-300">{tr('سجل تعليمي لقيم يدخلها المستخدم؛ لا يقدم حكماً صحياً أو توقعاً.', 'Educational log for user-entered values; no health judgment or prediction.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('تُعرض السجلات في هذه الصفحة فقط؛ لا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Records are held on this page only; they are not saved to your account or database and may disappear when you leave or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('اسم القياس', 'Metric name')}
      <input aria-label={tr('اسم القياس', 'Metric name')} maxLength={80} className="w-full rounded border bg-zinc-950 p-2 text-white" value={metric} onChange={(event) => { setMetric(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('القيمة الرقمية', 'Numeric value')}
      <input aria-label={tr('القيمة الرقمية', 'Numeric value')} type="number" inputMode="decimal" min="-1000000" max="1000000" step="any" className="w-full rounded border bg-zinc-950 p-2 text-white" value={value} onChange={(event) => { setValue(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('الوحدة كما أدخلتها (اختياري)', 'Unit as entered (optional)')}
      <input aria-label={tr('الوحدة كما أدخلتها (اختياري)', 'Unit as entered (optional)')} maxLength={24} className="w-full rounded border bg-zinc-950 p-2 text-white" value={unit} onChange={(event) => { setUnit(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={addRecord}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {records.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')} className="space-y-2">
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{records.map((record, index) => <li key={`${record.recordedOn}-${index}`} className="rounded border border-zinc-700 p-3">
        <p>{record.metric}: {record.value}{record.unit ? ` ${record.unit}` : ''}</p><p className="text-xs text-zinc-400">{record.recordedOn} · {tr('مدخل من المستخدم؛ بلا حكم أو توقع', 'User-entered; no judgment or prediction')}</p>
      </li>)}</ul>
    </section>}
  </main>;
}
