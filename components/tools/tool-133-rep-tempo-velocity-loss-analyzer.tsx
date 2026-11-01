'use client';
import { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { VelocityInputSchema, type VelocityInput } from '@/lib/tools/schemas/tool-133-rep-tempo-velocity-loss-analyzer';
import type { VelocityResult } from '@/lib/tools/engines/tool-133-rep-tempo-velocity-loss-analyzer.v6';
import { buildVelocityOutput } from '@/lib/tools/adapters/tool-133-rep-tempo-velocity-loss-analyzer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type SetDraft = { set_number: number; reps: string; weight_kg: string; avg_velocity_m_s: string; tempo: string };
const emptySet = (number: number): SetDraft => ({ set_number: number, reps: '', weight_kg: '', avg_velocity_m_s: '', tempo: '' });
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
export default function Tool133RepTempoVelocityLoss() {
  const { locale, unitSystem: unit } = useToolDisplayPreferences();

  const [sets, setSets] = useState<SetDraft[]>([emptySet(1)]);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => VelocityInputSchema.safeParse({ sets: sets.map((set) => ({ set_number: set.set_number, reps: set.reps === '' ? undefined : Number(set.reps), weight_kg: set.weight_kg === '' ? undefined : Number(set.weight_kg), avg_velocity_m_s: set.avg_velocity_m_s === '' ? undefined : Number(set.avg_velocity_m_s), tempo: set.tempo === '' ? undefined : Number(set.tempo) })) }), [sets]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<VelocityInput, VelocityResult>(input);
  const massUnit = unit === 'metric' ? 'kg' : 'lb';
  const update = (index: number, key: keyof SetDraft, raw: string) => setSets((rows) => rows.map((row, i) => i === index ? { ...row, [key]: key === 'weight_kg' && raw !== '' && unit === 'imperial' ? String(Number(raw) / 2.20462) : raw } : row));
  const shownWeight = (value: string) => value === '' ? '' : (Number(value) * (unit === 'imperial' ? 2.20462 : 1)).toFixed(1);
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('تحليل السرعة والإيقاع بين المجموعات', 'Between-set Velocity & Tempo Analysis')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{tr('أدخل قراءاتك المسجلة. لا بيانات نموذجية. يلزم قياسان للسرعة لحساب التغير بين المجموعات؛ هذا ليس قياسًا لحظيًا داخل المجموعة.', 'Enter your recorded readings. No sample data. Two velocity readings are required for between-set change; this is not within-set measurement.')}</p>
    <section className="space-y-3">{sets.map((set, index) => <div key={set.set_number} className="grid gap-3 rounded-xl border border-zinc-800 p-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-xs text-zinc-300">{tr('رقم المجموعة', 'Set number')}<input className={inputClass} type="number" value={set.set_number} readOnly aria-label={`${tr('رقم المجموعة', 'Set number')} ${index + 1}`} /></label>
      <label className="text-xs text-zinc-300">{tr('التكرارات', 'Reps')}<input className={inputClass} type="number" min="1" step="1" value={set.reps} onChange={(e) => update(index, 'reps', e.target.value)} aria-label={`${tr('التكرارات', 'Reps')} ${index + 1}`} /></label>
      <label className="text-xs text-zinc-300">{tr('الوزن', 'Load')} ({massUnit})<input className={inputClass} type="number" min="0" step="any" value={shownWeight(set.weight_kg)} onChange={(e) => update(index, 'weight_kg', e.target.value)} aria-label={`${tr('الوزن', 'Load')} ${index + 1}`} /></label>
      <label className="text-xs text-zinc-300">{tr('السرعة المتوسطة (م/ث، اختياري)', 'Average velocity (m/s, optional)')}<input className={inputClass} type="number" min="0.01" step="any" value={set.avg_velocity_m_s} onChange={(e) => update(index, 'avg_velocity_m_s', e.target.value)} aria-label={`${tr('السرعة المتوسطة', 'Average velocity')} ${index + 1}`} /></label>
      <div className="flex gap-2"><label className="flex-1 text-xs text-zinc-300">{tr('مدة الإيقاع (ث، اختياري)', 'Tempo duration (s, optional)')}<input className={inputClass} type="number" min="0.01" step="any" value={set.tempo} onChange={(e) => update(index, 'tempo', e.target.value)} aria-label={`${tr('مدة الإيقاع', 'Tempo duration')} ${index + 1}`} /></label><button type="button" disabled={sets.length === 1} onClick={() => { setSets((rows) => rows.filter((_, i) => i !== index).map((row, i) => ({ ...row, set_number: i + 1 }))); reset(); }} className="self-end rounded border border-zinc-700 px-3 py-2 text-xs text-white disabled:opacity-40">{tr('حذف', 'Remove')}</button></div>
    </div>)}</section>
    <div className="flex flex-wrap gap-2"><button type="button" disabled={sets.length >= 50} onClick={() => setSets((rows) => [...rows, emptySet(rows.length + 1)])} className="rounded border border-zinc-700 px-3 py-2 text-xs text-white disabled:opacity-40">{tr('إضافة مجموعة', 'Add set')}</button><button type="button" disabled={!input} onClick={() => input && calculate(input, buildVelocityOutput, locale, unit)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('حلل المجموعات', 'Analyze sets')}</button><button type="button" onClick={() => { reset(); setSets([emptySet(1)]); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {!input && <p role="alert" className="text-xs text-amber-300">{tr('أدخل تكرارات وحملًا صالحين لكل مجموعة.', 'Enter valid reps and load for every set.')}</p>}
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
