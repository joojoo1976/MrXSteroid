'use client';

import { useState } from 'react';
import { assembleCommandEntries } from '@/lib/tools/engines/tool-252-command-center.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Draft = { label: string; value: string; unit: string; source: string; recordedOn: string; freshness: '' | 'current' | 'old' | 'unknown' | 'conflicting' };
const blankDraft = (): Draft => ({ label: '', value: '', unit: '', source: '', recordedOn: '', freshness: '' });

export default function Tool252ManualContextBoard() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [drafts, setDrafts] = useState<Draft[]>([blankDraft()]);
  const [result, setResult] = useState<ReturnType<typeof assembleCommandEntries> | null>(null);
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const freshnessLabel = (value: Draft['freshness']) => ({
    '': tr('غير محدد', 'Not supplied'),
    current: tr('حديث بحسب إدخالي', 'Current, as entered'),
    old: tr('قديم بحسب إدخالي', 'Old, as entered'),
    unknown: tr('حداثته غير معروفة', 'Freshness unknown'),
    conflicting: tr('متعارض بحسب إدخالي', 'Conflicting, as entered'),
  }[value]);
  const missingFieldLabel = (field: 'value' | 'unit' | 'source' | 'recordedOn' | 'freshness') => ({
    value: tr('القيمة', 'value'),
    unit: tr('الوحدة', 'unit'),
    source: tr('المصدر', 'source'),
    recordedOn: tr('التاريخ', 'date'),
    freshness: tr('الحداثة/التعارض', 'freshness/conflict'),
  }[field]);

  const update = (index: number, patch: Partial<Draft>) => {
    setDrafts((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...patch } : entry));
    setResult(null);
    setError('');
  };

  const aggregate = () => {
    setResult(null);
    setError('');
    const entries = drafts.filter((entry) => entry.label.trim()).map((entry) => ({
      label: entry.label, value: entry.value || undefined, unit: entry.unit || undefined,
      source: entry.source || undefined, recordedOn: entry.recordedOn || undefined,
      freshness: entry.freshness || undefined,
    }));
    try {
      setResult(assembleCommandEntries({ entries }));
    } catch {
      setError(tr('تحقق من الحقول؛ الحد الأقصى 20 بنداً.', 'Check the fields; the limit is 20 entries.'));
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('لوحة السياق اليدوية', 'Manual Context Board')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{tr('أدخل البنود التي تختارها يدوياً. لا يجلب المركز بيانات من أدوات أخرى ولا يحسب أو يوحد النتائج.', 'Enter only the items you select manually. This board does not fetch data from other tools or calculate/unify results.')}</p>
      <div className="mt-5 space-y-4">
        {drafts.map((entry, index) => <fieldset key={index} className="grid gap-3 rounded-xl border border-zinc-700 p-4 sm:grid-cols-2">
          <legend className="px-2 text-sm font-bold">{tr('بند', 'Entry')} {index + 1}</legend>
          <label className="grid gap-1 text-sm">{tr('اسم البند', 'Entry label')}<input aria-label={`${tr('اسم البند', 'Entry label')} ${index + 1}`} maxLength={120} value={entry.label} onChange={(event) => update(index, { label: event.target.value })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" /></label>
          <label className="grid gap-1 text-sm">{tr('القيمة كما أدخلتها', 'Value as entered')}<input aria-label={`${tr('القيمة كما أدخلتها', 'Value as entered')} ${index + 1}`} maxLength={200} value={entry.value} onChange={(event) => update(index, { value: event.target.value })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" /></label>
          <label className="grid gap-1 text-sm">{tr('الوحدة', 'Unit')}<input aria-label={`${tr('الوحدة', 'Unit')} ${index + 1}`} maxLength={40} value={entry.unit} onChange={(event) => update(index, { unit: event.target.value })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" /></label>
          <label className="grid gap-1 text-sm">{tr('المصدر', 'Source')}<input aria-label={`${tr('المصدر', 'Source')} ${index + 1}`} maxLength={240} value={entry.source} onChange={(event) => update(index, { source: event.target.value })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" /></label>
          <label className="grid gap-1 text-sm">{tr('تاريخ التسجيل', 'Recorded date')}<input aria-label={`${tr('تاريخ التسجيل', 'Recorded date')} ${index + 1}`} type="date" value={entry.recordedOn} onChange={(event) => update(index, { recordedOn: event.target.value })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" dir="ltr" /></label>
          <label className="grid gap-1 text-sm">{tr('حداثة/تعارض حسب إدخالي', 'Freshness/conflict, as entered')}<select aria-label={`${tr('حداثة/تعارض حسب إدخالي', 'Freshness/conflict, as entered')} ${index + 1}`} value={entry.freshness} onChange={(event) => update(index, { freshness: event.target.value as Draft['freshness'] })} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white">
            <option value="">{tr('اختر الحالة', 'Choose a status')}</option>
            {(['current', 'old', 'unknown', 'conflicting'] as const).map((status) => <option value={status} key={status}>{freshnessLabel(status)}</option>)}
          </select></label>
          {drafts.length > 1 && <button type="button" onClick={() => { setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index)); setResult(null); }} className="justify-self-start text-sm text-red-400">{tr('احذف البند', 'Remove entry')}</button>}
        </fieldset>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={drafts.length >= 20} onClick={() => setDrafts((current) => [...current, blankDraft()])} className="rounded border border-zinc-600 px-4 py-2 disabled:opacity-50">{tr('أضف بنداً', 'Add entry')}</button>
        <button type="button" onClick={aggregate} className="rounded bg-blue-600 px-4 py-2 font-bold text-white">{tr('اعرض اختياراتي', 'Review selected entries')}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {result && <div role="status" className="mt-5 rounded-xl border border-zinc-700 p-4">
        <h2 className="font-bold">{result.status === 'PARTIAL' ? tr('بيانات جزئية', 'Partial data') : tr('مدخلات يدوية', 'Manual entries')}</h2>
        {result.entries.length === 0 ? <p className="mt-2 text-sm">{tr('لم تدخل بنداً بعد.', 'No entry has been entered.')}</p> : <ul className="mt-3 space-y-3">{result.entries.map((item, index) => <li key={`${item.label}-${index}`} className="rounded border border-zinc-800 p-3">
          <strong>{item.label}</strong><p>{tr('القيمة', 'Value')}: {item.value || tr('غير متاحة', 'Not supplied')} {item.unit}</p>
          <p>{tr('المصدر', 'Source')}: {item.source || tr('غير متاح', 'Not supplied')} · {item.recordedOn || tr('التاريخ غير متاح', 'Date not supplied')}</p>
          <p>{freshnessLabel(item.freshness ?? '')}</p>
          {item.missingFields.length > 0 && <p className="text-amber-400">{tr('الناقص', 'Missing')}: {item.missingFields.map(missingFieldLabel).join(', ')}</p>}
        </li>)}</ul>}
        <p className="mt-3 text-xs text-zinc-500">{tr('الحالة والمصدر والحداثة كما أدخلها المستخدم؛ لم يتم التحقق منها أو دمجها في توصية.', 'Source, status, and freshness are user-entered and unverified; they are not merged into a recommendation.')}</p>
      </div>}
    </section>
  );
}
