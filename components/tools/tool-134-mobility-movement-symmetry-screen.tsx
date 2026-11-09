'use client';
import { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { MobilityScreenSchema, type MobilityScreenInput } from '@/lib/tools/schemas/tool-134-mobility-movement-symmetry-screen';
import type { MobilityScreenResult } from '@/lib/tools/engines/tool-134-mobility-movement-symmetry-screen.v6';
import { buildMobilityScreenOutput } from '@/lib/tools/adapters/tool-134-mobility-movement-symmetry-screen';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

type Draft = { movement: MobilityScreenInput['movement']; left_value: string; right_value: string; unit: MobilityScreenInput['unit'] };
const initial: Draft = { movement: 'ankle_dorsiflexion', left_value: '', right_value: '', unit: 'degrees' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
export default function Tool134MobilityScreen() {
  const { locale } = useToolDisplayPreferences();
  const [form, setForm] = useState<Draft>(initial);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => MobilityScreenSchema.safeParse({ ...form, left_value: form.left_value === '' ? undefined : Number(form.left_value), right_value: form.right_value === '' ? undefined : Number(form.right_value) }), [form]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<MobilityScreenInput, MobilityScreenResult>(input);
  const changeMovement = (movement: MobilityScreenInput['movement']) => setForm((old) => ({ ...old, movement, left_value: '', right_value: '', unit: movement === 'single_leg_balance' ? 'seconds' : 'degrees' }));
  const options: Array<[MobilityScreenInput['movement'], string, string]> = [
    ['ankle_dorsiflexion', 'ثني الكاحل', 'Ankle dorsiflexion'], ['shoulder_flexion', 'رفع الكتف', 'Shoulder flexion'], ['hip_rotation', 'دوران الورك', 'Hip rotation'], ['single_leg_balance', 'اتزان على قدم واحدة', 'Single-leg balance'],
  ];
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('فحص مقارنة الحركة بين الجانبين', 'Side-to-side Movement Screen')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{tr('قارن قياساتك المدخلة فقط. حد المراجعة قاعدة تطبيقية ولا يشخص مشكلة حركية.', 'Compare only the values you enter. The review threshold is an app rule, not a mobility diagnosis.')}</p>
    <section className="grid gap-3 sm:grid-cols-3"><label className="text-xs text-zinc-300">{tr('الحركة', 'Movement')}<select aria-label={tr('الحركة', 'Movement')} className={inputClass} value={form.movement} onChange={(e) => changeMovement(e.target.value as MobilityScreenInput['movement'])}>{options.map(([value, ar, en]) => <option key={value} value={value}>{tr(ar, en)}</option>)}</select></label>
      {(['left_value', 'right_value'] as const).map((key) => <label key={key} className="text-xs text-zinc-300">{key === 'left_value' ? tr('الجانب الأيسر', 'Left side') : tr('الجانب الأيمن', 'Right side')} ({form.unit === 'degrees' ? '°' : tr('ثانية', 's')})<input data-r6-slider="true" aria-label={key === 'left_value' ? tr('الجانب الأيسر', 'Left side') : tr('الجانب الأيمن', 'Right side')} type="number" min="0" max="200" step="any" value={form[key]} onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))} className={inputClass} /></label>)}
    </section>
    {!input && <p role="alert" className="text-xs text-amber-300">{tr('أدخل قياسًا لكل جانب ضمن النطاق المحدد.', 'Enter one in-range value for each side.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildMobilityScreenOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('قارن القياسات', 'Compare values')}</button><button type="button" onClick={() => { reset(); setForm(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
