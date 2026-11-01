'use client';

import { useState } from 'react';
import { recordFiberObservation } from '@/lib/tools/engines/tool-238-fiber-type.v7';
import { FiberObservationInputV7Schema } from '@/lib/tools/schemas/tool-238-fiber-type-adaptation-score.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool238FiberObservationLog() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [draft, setDraft] = useState({ exercise: '', testMethod: '', observedResult: '', sourceReference: '' });
  const [result, setResult] = useState<ReturnType<typeof recordFiberObservation> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const update = (key: keyof typeof draft, value: string) => { setDraft((current) => ({ ...current, [key]: value })); setResult(null); setError(null); };
  const record = () => {
    const candidate = { ...draft, ...(draft.sourceReference.trim() ? {} : { sourceReference: undefined }) };
    const parsed = FiberObservationInputV7Schema.safeParse(candidate);
    if (!parsed.success) {
      setError(tr('أدخل التمرين وطريقة الملاحظة والنتيجة المسجلة.', 'Enter an exercise, observation method, and recorded result.'));
      setResult(null);
      return;
    }
    setResult(recordFiberObservation(parsed.data));
    setError(null);
  };
  const field = (key: keyof typeof draft, label: string, multiline = false) => <label className="block text-sm font-semibold text-zinc-200">{label}{multiline ? <textarea className={`${inputClass} min-h-24`} maxLength={400} value={draft[key]} onChange={(event) => update(key, event.target.value)} /> : <input className={inputClass} maxLength={500} value={draft[key]} onChange={(event) => update(key, event.target.value)} />}</label>;

  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black">{tr('سجل ملاحظات الأداء المرتبطة بالألياف', 'Fiber-Related Performance Observation Log')}</h1><p className="mt-2 text-sm text-zinc-300">{tr('يمكنك تسجيل ملاحظة أداء. لا تستنتج الأداة نوع الألياف العضلية أو درجة التكيف من التفضيلات أو الأداء.', 'Record a performance observation. This tool does not infer muscle-fiber type or adaptation from preferences or performance.')}</p></header>
    <p role="note" className="rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-100">{tr('الدرجة: غير متاحة — لا يوجد في هذه الأداة نموذج موثق صالح لتحديد نوع الألياف.', 'Score: not available — this tool has no validated model for determining fiber type.')}</p>
    <section className="grid gap-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">{field('exercise', tr('التمرين', 'Exercise'))}{field('testMethod', tr('طريقة/سياق الملاحظة', 'Observation method / context'))}{field('observedResult', tr('النتيجة كما سجلتها', 'Result as recorded'), true)}{field('sourceReference', tr('مرجع السجل (اختياري)', 'Record reference (optional)'))}</section>
    <button type="button" onClick={record} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black">{tr('سجل الملاحظة', 'Record observation')}</button>
    {error && <p role="alert" className="rounded-lg border border-amber-700 p-3 text-sm text-amber-200">{error}</p>}
    {result && <section role="status" className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900 p-4"><h2 className="font-bold">{tr('تم تسجيل بيانات المستخدم', 'User-provided observation recorded')}</h2><p>{result.entry.exercise}: {result.entry.observedResult}</p><p className="text-sm text-amber-200">{tr('لا توجد درجة ألياف محسوبة ولا توصية تدريبية.', 'No fiber score or training recommendation was calculated.')}</p></section>}
  </main>;
}
