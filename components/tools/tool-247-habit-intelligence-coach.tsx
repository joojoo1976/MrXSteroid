'use client';

import { useState } from 'react';
import { recordHabit } from '@/lib/tools/engines/tool-247-habit-coach.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool247HabitCheckInLog() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [habit, setHabit] = useState('');
  const [recordedOn, setRecordedOn] = useState(new Date().toISOString().slice(0, 10));
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof recordHabit> | null>(null);
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const record = () => {
    setResult(null);
    setError('');
    try {
      setResult(recordHabit({ habit, recordedOn, completed }));
    } catch {
      setError(tr('أدخل العادة وتاريخاً صالحاً.', 'Enter a habit and a valid date.'));
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('سجل متابعة العادات', 'Habit Check-in Log')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{tr('سجل ما تختاره وحالة الإتمام كما أدخلتها؛ لا يحسب الأداة درجة التزام.', 'Record your selected habit and completion state; this tool does not calculate an adherence score.')}</p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">{tr('العادة', 'Habit')}<input aria-label={tr('العادة', 'Habit')} maxLength={120} value={habit} onChange={(event) => setHabit(event.target.value)} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" /></label>
        <label className="grid gap-1 text-sm">{tr('تاريخ التسجيل', 'Record date')}<input aria-label={tr('تاريخ التسجيل', 'Record date')} type="date" value={recordedOn} onChange={(event) => setRecordedOn(event.target.value)} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" dir="ltr" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />{tr('اكتملت بحسب إدخالي', 'Completed, as recorded by me')}</label>
      </div>
      <button type="button" onClick={record} className="mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white">{tr('سجل الحالة', 'Record check-in')}</button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {result && <p role="status" className="mt-3 rounded border border-emerald-700 p-3">{result.entry.habit} · {result.entry.recordedOn} · {result.entry.completed ? tr('مكتملة', 'Completed') : tr('غير مكتملة', 'Not completed')}</p>}
      <p className="mt-4 text-xs text-zinc-500">{tr('سجل يدوي فقط؛ لا تحليل سلوكي أو تنبؤ أو توصيات تدريبية. لا تخزين دائم.', 'Manual log only; no behavioral analysis, prediction, or coaching recommendations. No persistent storage.')}</p>
    </section>
  );
}
