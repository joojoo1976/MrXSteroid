'use client';

import React, { useState } from 'react';
import { recordLabObservation, LabObservationSchema } from '@/lib/tools/engines/tool-164-post-cycle-bloodwork.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Entry = ReturnType<typeof recordLabObservation>['entry'];

export default function Tool164() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const add = () => {
    const parsed = LabObservationSchema.safeParse({ marker, value: value === '' ? Number.NaN : Number(value), unit });
    if (!parsed.success) { setError(tr('أدخل اسم التحليل وقيمة رقمية محدودة ووحدتها كما وردت.', 'Enter a marker name, finite numeric value, and its reported unit.')); return; }
    const result = recordLabObservation(parsed.data);
    setEntries((current) => [...current, result.entry]);
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل ملاحظات التحاليل', 'Lab Observation Record')}</h1>
    <p className="text-sm text-zinc-300">{tr('تسجيل ما يدخله المستخدم فقط؛ لا تفسير أو مقارنة بنطاق مرجعي أو تشخيص.', 'User-provided record only; no interpretation, reference-range comparison, or diagnosis.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('المدخلات تبقى في حالة الصفحة الحالية فقط ولا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Entries remain only in the current page state. They are not saved to your account or database and may disappear on navigation or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('اسم التحليل أو المؤشر', 'Lab marker name')}
      <input aria-label={tr('اسم التحليل أو المؤشر', 'Lab marker name')} maxLength={100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={marker} onChange={(event) => { setMarker(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('القيمة كما وردت', 'Value as reported')}
      <input aria-label={tr('القيمة كما وردت', 'Value as reported')} type="number" step="any" inputMode="decimal" max="1000000" className="w-full rounded border bg-zinc-950 p-2 text-white" value={value} onChange={(event) => { setValue(event.target.value); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('الوحدة كما وردت', 'Unit as reported')}
      <input aria-label={tr('الوحدة كما وردت', 'Unit as reported')} maxLength={30} className="w-full rounded border bg-zinc-950 p-2 text-white" value={unit} onChange={(event) => { setUnit(event.target.value); setError(null); }} />
    </label>
    <p className="text-xs text-zinc-400">{tr('لا تتحقق الأداة من المصدر أو الوحدات أو النطاقات المرجعية.', 'The tool does not verify the source, units, or reference ranges.')}</p>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={add}>{tr('أضف إلى سجل الصفحة', 'Add to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {entries.length > 0 && <section aria-live="polite" aria-label={tr('السجلات الحالية', 'Current page records')}>
      <h2 className="font-bold">{tr('السجلات الحالية', 'Current page records')}</h2>
      <ul className="space-y-2">{entries.map((entry, index) => <li key={`${entry.marker}-${index}`} className="rounded border border-zinc-700 p-3"><strong>{entry.marker}</strong><p>{entry.value} {entry.unit}</p><p className="text-xs text-zinc-400">{tr('قيمة من المستخدم؛ بلا تفسير', 'User-provided value; no interpretation')}</p></li>)}</ul>
    </section>}
  </main>;
}
