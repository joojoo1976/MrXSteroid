'use client';

import { useMemo, useRef, useState } from 'react';
import {
  assembleManualToolResults,
  inspectManualAggregationDraft,
  type ManualAggregationEntry,
  type ManualAggregationResult,
} from '@/lib/tools/engines/tool-150-ai-performance-command-center.v6';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { useToolResultSharing } from '@/context/SmartToolsSessionContext';
import { validateCrossToolImportV7 } from '@/lib/tools/shared-data/cross-tool-result.v7';

const controlClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const initialEntry = (id: string): ManualAggregationEntry => ({ id, metric: '', status: 'unknown' });

export default function Tool150ManualResultsOrganizer() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [entries, setEntries] = useState<ManualAggregationEntry[]>([initialEntry('manual-1')]);
  const [result, setResult] = useState<ManualAggregationResult | null>(null);
  const [selectedSharedResultIds, setSelectedSharedResultIds] = useState<string[]>([]);
  const [sharedImportError, setSharedImportError] = useState<string | null>(null);
  const nextId = useRef(2);
  const sharedResultAccess = useToolResultSharing('tool-150-ai-performance-command-center');
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const draftState = useMemo(() => inspectManualAggregationDraft({ entries }), [entries]);
  const hasNamedEntry = entries.some((entry) => entry.metric.trim().length > 0);

  const importSelectedSharedResults = () => {
    const selected = sharedResultAccess.sharedResults.filter((shared) => selectedSharedResultIds.includes(shared.resultId));
    if (selected.length === 0) return;
    const imported: ManualAggregationEntry[] = [];
    for (const envelope of selected) {
      if (envelope.sourceToolId !== 'tool-149-physique-trajectory-simulator') {
        setSharedImportError(tr('مصدر هذه النتيجة غير معتمد للاستيراد في هذه النسخة.', 'This result source is not approved for import in this version.'));
        return;
      }
      const expectedUnits: Record<string, string> = {};
      for (let scenario = 1; scenario <= 3; scenario += 1) {
        expectedUnits[`scenario_${scenario}_target_weight`] = 'kg';
        expectedUnits[`scenario_${scenario}_duration`] = 'week';
        expectedUnits[`scenario_${scenario}_weekly_rate`] = 'kg/week';
      }
      if (envelope.fields.some((field) => expectedUnits[field.key] === undefined)) {
        setSharedImportError(tr('تحتوي النتيجة على حقل غير مدعوم؛ لم يتم استيرادها.', 'The result contains an unsupported field; nothing was imported.'));
        return;
      }
      const decision = validateCrossToolImportV7(
        envelope,
        'tool-150-ai-performance-command-center',
        envelope.fields.map((field) => ({ key: field.key, unit: expectedUnits[field.key] })),
        { now: Date.now() },
      );
      if (decision.status !== 'READY') {
        setSharedImportError(tr(`تعذر الاستيراد: ${decision.status}. لم تُضف أي نتيجة.`, `Import rejected: ${decision.status}. No entries were added.`));
        return;
      }
      for (const field of decision.fields) {
        imported.push({
          id: `shared-${nextId.current++}`,
          metric: field.sourceLabel,
          value: String(field.value),
          unit: field.unit,
          source: decision.sourceToolId,
          derivedAt: decision.createdAt,
          status: 'unknown',
          note: `Imported result ${envelope.resultId}; origin ${field.origin}; the source did not provide a measurement date; freshness and validity were not assessed.`,
        });
      }
    }
    if (entries.length + imported.length > 20) {
      setSharedImportError(tr('لا توجد مساحة كافية؛ احذف بعض الصفوف قبل الاستيراد.', 'There is not enough room; remove some rows before importing.'));
      return;
    }
    setEntries((current) => [...current, ...imported]);
    setResult(null);
    setSelectedSharedResultIds([]);
    setSharedImportError(null);
  };

  const updateEntry = (id: string, field: keyof ManualAggregationEntry, value: string) => {
    setResult(null);
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const addEntry = () => {
    setResult(null);
    setEntries((current) => {
      if (current.length >= 20) return current;
      const id = `manual-${nextId.current}`;
      nextId.current += 1;
      return [...current, initialEntry(id)];
    });
  };

  const removeEntry = (id: string) => {
    setResult(null);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const fieldLabel = (field: string) => ({
    metric: tr('اسم المؤشر', 'Metric name'),
    value: tr('القيمة كما وردت', 'Value as reported'),
    unit: tr('الوحدة كما وردت', 'Unit as reported'),
    source: tr('مصدر النتيجة أو الأداة', 'Result source or tool'),
    recordedOn: tr('تاريخ تسجيل النتيجة', 'Result date'),
    note: tr('ملاحظة اختيارية', 'Optional note'),
  }[field] ?? field);

  const statusLabel = (status: ManualAggregationEntry['status']) => ({
    current: tr('محدد كحالي — من اختيارك', 'Marked current — user selected'),
    old: tr('قديم — من اختيارك', 'Old — user selected'),
    incomplete: tr('بيانات ناقصة', 'Incomplete data'),
    unknown: tr('الحالة غير معروفة', 'Status unknown'),
  }[status]);

  const resultStatusLabel = (status: ManualAggregationResult['status']) => ({
    ASSEMBLED: tr('مجمّع يدوياً', 'Manually assembled'),
    PARTIAL: 'PARTIAL',
    CONFLICTED: tr('متعارض — يلزم فحص يدوي', 'Conflicted — manual review needed'),
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    INVALID_INPUT: 'INVALID_INPUT',
  }[status]);

  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header>
      <h1 className="text-2xl font-black text-white">{tr('منظّم نتائج الأداء اليدوي', 'Manual Performance Results Organizer')}</h1>
      <p className="mt-2 text-sm text-zinc-300">{tr(
        'أدخل النتائج التي تختارها بنفسك لعرضها في مكان واحد. لا تشغّل الأداة أدوات أخرى ولا تدمج القيم في تقييم موحّد.',
        'Enter results you choose manually to view them together. This tool does not run other tools or combine values into a unified assessment.',
      )}</p>
    </header>

    <section className="space-y-2 rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-100" aria-label={tr('حدود الخصوصية والنتائج', 'Privacy and result boundaries')}>
      <p>{tr(
        'تظل المدخلات في حالة الصفحة الحالية فقط؛ لا تُحفظ ولا تُرسل. ستُمسح عند تحديث الصفحة أو مغادرتها.',
        'Entries remain only in this page’s current memory; they are not saved or sent. They are cleared when you refresh or leave the page.',
      )}</p>
      <p>{tr(
        'اعرض الوحدة والمصدر والتاريخ كما أدخلتها. لا تحوّل الأداة الوحدات ولا تتحقق من المصدر أو حداثة البيانات؛ حالة «حالي/قديم» من اختيارك.',
        'Units, sources, and dates are shown as entered. The tool does not convert units or verify sources or freshness; “current/old” is your selection.',
      )}</p>
      <p>{tr('لا توجد توصية أو درجة أداء أو تحليل ذكاء اصطناعي في هذه الأداة.', 'This tool provides no recommendation, performance score, or AI analysis.')}</p>
    </section>

    {sharedResultAccess.sharedResults.length > 0 && <section className="space-y-3 rounded-xl border border-violet-800 bg-violet-950/20 p-4" aria-label={tr('نتائج شاركتها الأدوات صراحةً', 'Results explicitly shared by tools')}>
      <h2 className="font-bold text-white">{tr('نتائج أتاحها المستخدم صراحةً لهذه الأداة', 'Results the user explicitly shared with this tool')}</h2>
      <p className="text-sm text-zinc-300">{tr('لا تُستورد النتائج تلقائياً. اختر نتيجة لمراجعة حقولها واستيرادها. تظل الحالة Unknown ولا تستنتج الأداة حداثتها أو صحتها.', 'Results are never imported automatically. Select a result to review and import its fields. Status remains Unknown; freshness and validity are not inferred.')}</p>
      {sharedResultAccess.sharedResults.map((shared) => <article key={shared.resultId} className="space-y-2 rounded-lg border border-zinc-700 p-3">
        <label className="flex items-start gap-2 text-sm text-zinc-200">
          <input type="checkbox" checked={selectedSharedResultIds.includes(shared.resultId)} onChange={(event) => setSelectedSharedResultIds((current) => event.target.checked ? [...current, shared.resultId] : current.filter((id) => id !== shared.resultId))} />
          <span>{shared.sourceToolId} · {shared.createdAt} · {shared.privacyClass} · {shared.fields.length} {tr('حقول', 'fields')}</span>
        </label>
        <ul className="list-inside list-disc text-xs text-zinc-300">{shared.fields.map((field) => <li key={field.key}>{field.sourceLabel}: {String(field.value)} {field.unit ?? ''} · {field.origin}</li>)}</ul>
        <button type="button" onClick={() => sharedResultAccess.revokeResult(shared.resultId)} className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-white">{tr('إلغاء إتاحة هذه النتيجة', 'Revoke access to this result')}</button>
      </article>)}
      {sharedImportError && <p role="alert" className="text-sm text-red-300">{sharedImportError}</p>}
      <button type="button" disabled={selectedSharedResultIds.length === 0} onClick={importSelectedSharedResults} className="rounded-lg border border-violet-600 px-3 py-2 text-sm text-white disabled:opacity-40">{tr('استيراد النتائج المحددة', 'Import selected results')}</button>
    </section>}

    <section className="space-y-4" aria-label={tr('النتائج المختارة يدوياً', 'Manually selected results')}>
      {entries.map((entry, index) => <fieldset key={entry.id} className="space-y-3 rounded-xl border border-zinc-700 p-4">
        <legend className="px-2 font-bold text-white">{tr(`نتيجة ${index + 1}`, `Entry ${index + 1}`)}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['metric', 'value', 'unit', 'source', 'recordedOn', 'note'] as const).map((field) => <label key={field} className="text-xs text-zinc-300">
            {fieldLabel(field)}
            <input
              aria-label={`${fieldLabel(field)} ${index + 1}`}
              className={controlClass}
              type={field === 'recordedOn' ? 'date' : 'text'}
              maxLength={field === 'recordedOn' ? undefined : field === 'metric' ? 120 : field === 'value' ? 160 : field === 'note' ? 300 : 160}
              value={entry[field] ?? ''}
              onChange={(event) => updateEntry(entry.id, field, event.target.value)}
            />
          </label>)}
          <label className="text-xs text-zinc-300">{tr('حالة البيانات', 'Data status')}
            <select aria-label={`${tr('حالة البيانات', 'Data status')} ${index + 1}`} className={controlClass} value={entry.status} onChange={(event) => updateEntry(entry.id, 'status', event.target.value)}>
              {(['unknown', 'current', 'old', 'incomplete'] as const).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
          </label>
        </div>
        <button type="button" onClick={() => removeEntry(entry.id)} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs text-white">{tr('حذف هذه النتيجة', 'Remove this entry')}</button>
      </fieldset>)}
    </section>

    {draftState.status === 'PARTIAL' && <p role="status" className="text-sm text-amber-300"><strong>PARTIAL</strong> · {tr('بعض المدخلات ناقصة أو حالتها غير مؤكدة؛ ستظهر دون استكمالها بالافتراض.', 'Some entries are incomplete or uncertain; they will be displayed without filling gaps by assumption.')}</p>}
    {draftState.status === 'INVALID_INPUT' && <div role="alert" className="text-sm text-red-300"><strong>INVALID_INPUT</strong> · {draftState.errors.map((error) => `${fieldLabel(error.field)}: ${error.message}`).join(' · ')}</div>}
    {draftState.status === 'NOT_AVAILABLE' && <p role="status" className="text-sm text-zinc-400">NOT_AVAILABLE · {tr('أضف نتيجة يدوية واحدة على الأقل.', 'Add at least one manual result.')}</p>}

    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={entries.length >= 20} onClick={addEntry} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white disabled:opacity-40">{tr('إضافة نتيجة', 'Add result')}</button>
      <button type="button" disabled={!hasNamedEntry || draftState.status === 'INVALID_INPUT'} onClick={() => setResult(assembleManualToolResults({ entries }))} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('اعرض التجميع اليدوي', 'Review manual aggregation')}</button>
      <button type="button" onClick={() => { setEntries([]); setResult(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('مسح الكل', 'Clear all')}</button>
    </div>

    {result && <section aria-live="polite" className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
      <header>
        <h2 className="text-lg font-bold text-white">{tr('مراجعة التجميع اليدوي', 'Manual aggregation review')}</h2>
        <p className="mt-1 text-sm text-lime-300"><strong>{resultStatusLabel(result.status)}</strong></p>
        {'reason' in result && result.reason && <p className="mt-1 text-sm text-amber-200">{result.reason}</p>}
      </header>
      {'entries' in result && result.entries.map((item) => <article key={item.id} className="space-y-2 rounded-lg border border-zinc-700 p-3">
        <h3 className="font-bold text-white">{item.metric}</h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-zinc-400">{fieldLabel('value')}</dt><dd className="text-white">{item.value || '—'} {item.unit || ''}</dd></div>
          <div><dt className="text-zinc-400">{fieldLabel('source')}</dt><dd className="text-white">{item.source || '—'}</dd></div>
          <div><dt className="text-zinc-400">{fieldLabel('recordedOn')}</dt><dd className="text-white">{item.recordedOn || '—'}</dd></div>
          <div><dt className="text-zinc-400">{tr('الحالة', 'Status')}</dt><dd className="text-white">{statusLabel(item.status)}</dd></div>
          {item.derivedAt && <div><dt className="text-zinc-400">{tr('وقت إنشاء النتيجة الحسابية', 'Calculated result timestamp')}</dt><dd className="text-white">{item.derivedAt}</dd></div>}
        </dl>
        {item.note && <p className="text-sm text-zinc-300">{item.note}</p>}
        {item.disclosure.length > 0 && <ul className="list-inside list-disc text-xs text-amber-200">{item.disclosure.map((line) => <li key={line}>{line}</li>)}</ul>}
      </article>)}
      {'conflicts' in result && result.conflicts.length > 0 && <div role="alert" className="rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
        <h3 className="font-bold">{tr('تعارضات تحتاج مراجعة بشرية', 'Conflicts requiring human review')}</h3>
        <ul className="mt-2 list-inside list-disc">{result.conflicts.map((conflict) => <li key={`${conflict.metric}-${conflict.kind}`}>{conflict.metric}: {conflict.kind === 'VALUE_CONFLICT' ? tr('قيم مختلفة للوحدة نفسها', 'different values with the same unit') : tr('وحدات مختلفة؛ لم تتم المقارنة الحسابية', 'different units; no numeric comparison was made')}</li>)}</ul>
      </div>}
      <p className="text-xs text-zinc-400">{tr('هذه قائمة يدوية فقط؛ لا يوجد مجموع أو ترتيب أو توصية موحّدة.', 'This is a manual list only; no total, ranking, or unified recommendation is produced.')}</p>
    </section>}
  </main>;
}
