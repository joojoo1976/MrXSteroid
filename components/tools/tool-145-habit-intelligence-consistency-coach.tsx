'use client';

import { useMemo, useState } from 'react';
import { HabitConsistencyInputSchema, type HabitConsistencyInput } from '@/lib/tools/schemas/tool-145-habit-intelligence-consistency-coach';
import type { HabitConsistencyResult } from '@/lib/tools/engines/tool-145-habit-intelligence-consistency-coach.v6';
import { buildHabitConsistencyOutput } from '@/lib/tools/adapters/tool-145-habit-intelligence-consistency-coach';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type HabitDraft = { name: string; completed: boolean[] };
const blankHabit = (): HabitDraft => ({ name: '', completed: Array(7).fill(false) });
const days: Array<[string, string]> = [['السبت', 'Sat'], ['الأحد', 'Sun'], ['الاثنين', 'Mon'], ['الثلاثاء', 'Tue'], ['الأربعاء', 'Wed'], ['الخميس', 'Thu'], ['الجمعة', 'Fri']];
const inputClass = 'rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool145HabitConsistencyCoach() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [habits, setHabits] = useState<HabitDraft[]>([blankHabit()]);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => HabitConsistencyInputSchema.safeParse({ habits }), [habits]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<HabitConsistencyInput, HabitConsistencyResult>(input);
  const updateHabit = (index: number, update: Partial<HabitDraft>) => { reset(); setHabits((current) => current.map((habit, i) => i === index ? { ...habit, ...update } : habit)); };
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('متابعة الالتزام بالعادات الأسبوعية', 'Weekly Habit Consistency Tracker')}</h1></header>
    <p className="text-sm text-zinc-300">{tr('سجّل ما حدث خلال أسبوع واحد. النسب تلخّص العلامات التي أدخلتها ولا تحكم على جودة العادة أو أسباب الالتزام.', 'Record what happened during one week. Percentages summarize your entries and do not judge habit quality or explain consistency.')}</p>
    <section className="space-y-4">{habits.map((habit, index) => <fieldset key={index} className="space-y-3 rounded-xl border border-zinc-800 p-4"><legend className="px-2 text-sm font-bold text-white">{tr('العادة', 'Habit')} {index + 1}</legend><div className="flex gap-2"><label className="sr-only" htmlFor={`habit-name-${index}`}>{tr('اسم العادة', 'Habit name')} {index + 1}</label><input id={`habit-name-${index}`} className={`${inputClass} min-w-0 flex-1`} maxLength={48} value={habit.name} placeholder={tr('اكتب اسم العادة', 'Enter a habit name')} onChange={(event) => updateHabit(index, { name: event.target.value })} />{habits.length > 1 && <button type="button" className="rounded-lg border border-zinc-700 px-3 text-sm text-white" onClick={() => { reset(); setHabits((current) => current.filter((_, i) => i !== index)); }}>{tr('حذف', 'Remove')}</button>}</div><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{days.map(([arDay, enDay], dayIndex) => <label key={enDay} className="flex items-center gap-2 rounded-lg bg-zinc-900 p-2 text-xs text-zinc-200"><input type="checkbox" checked={habit.completed[dayIndex]} aria-label={`${tr(arDay, enDay)} · ${habit.name || tr('العادة', 'habit')} ${index + 1}`} onChange={(event) => { const completed = [...habit.completed]; completed[dayIndex] = event.target.checked; updateHabit(index, { completed }); }} />{tr(arDay, enDay)}</label>)}</div></fieldset>)}</section>
    <div className="flex flex-wrap gap-2"><button type="button" disabled={habits.length >= 8} onClick={() => { reset(); setHabits((current) => [...current, blankHabit()]); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white disabled:opacity-40">{tr('إضافة عادة', 'Add habit')}</button><button type="button" disabled={!input} onClick={() => input && calculate(input, buildHabitConsistencyOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('احسب ملخص الأسبوع', 'Calculate weekly summary')}</button><button type="button" onClick={() => { reset(); setHabits([blankHabit()]); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {habits.some((habit) => habit.name.trim() === '') && <p role="alert" className="text-sm text-amber-300">{tr('أدخل اسماً لكل عادة قبل الحساب.', 'Enter a name for every habit before calculating.')}</p>}
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
