'use client';
import { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { ExerciseSubstitutionSchema, type ExerciseSubstitutionInput } from '@/lib/tools/schemas/tool-135-exercise-substitution-ai';
import type { ExerciseSubstitutionResult } from '@/lib/tools/engines/tool-135-exercise-substitution-ai.v6';
import { buildExerciseSubstitutionOutput } from '@/lib/tools/adapters/tool-135-exercise-substitution-ai';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

const initial: ExerciseSubstitutionInput = { movement_pattern: 'squat', available_equipment: [], avoid_movements: [], pain_reported: false };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const patterns: Array<[ExerciseSubstitutionInput['movement_pattern'], string, string]> = [['squat','قرفصاء','Squat'],['hinge','مفصل الورك','Hip hinge'],['push','دفع','Push'],['pull','سحب','Pull'],['carry','حمل','Carry']];
const gear = ['bodyweight','dumbbell','cable','machine','band'] as const;
const avoids = ['squat','hinge','push','pull','carry','overhead','impact'] as const;
export default function Tool135ExerciseSubstitution() {
  const { locale } = useToolDisplayPreferences();
  const [form, setForm] = useState<ExerciseSubstitutionInput>(initial);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => ExerciseSubstitutionSchema.safeParse(form), [form]);
  const input = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<ExerciseSubstitutionInput, ExerciseSubstitutionResult>(input);
  const toggleList = (key: 'available_equipment' | 'avoid_movements', item: string) => setForm((old) => ({ ...old, [key]: old[key].includes(item as never) ? old[key].filter((value) => value !== item) : [...old[key], item] }) as ExerciseSubstitutionInput);
  const labels: Record<string, [string, string]> = { bodyweight: ['وزن الجسم','Bodyweight'], dumbbell: ['دمبل','Dumbbell'], cable: ['كابل','Cable'], machine: ['جهاز','Machine'], band: ['مطاط مقاومة','Resistance band'], squat: ['قرفصاء','Squat'], hinge: ['مفصل الورك','Hip hinge'], push: ['دفع','Push'], pull: ['سحب','Pull'], carry: ['حمل','Carry'], overhead: ['فوق الرأس','Overhead'], impact: ['صدمات','Impact'] };
  const label = (item: string) => labels[item]?.[locale === 'ar' ? 0 : 1] ?? item;
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('خيارات بديلة لحركة التمرين', 'Movement Substitution Options')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{tr('قواعد ثابتة تطابق الحركة والمعدات؛ ليست ذكاءً اصطناعيًا أو تقييم إصابة. عند وجود ألم لا تتدرب خلاله.', 'Fixed rules match movement and equipment; this is not AI or an injury assessment. Do not train through pain.')}</p>
    <label className="block text-xs text-zinc-300">{tr('نمط الحركة', 'Movement pattern')}<select aria-label={tr('نمط الحركة', 'Movement pattern')} className={inputClass} value={form.movement_pattern} onChange={(e) => setForm((old) => ({ ...old, movement_pattern: e.target.value as ExerciseSubstitutionInput['movement_pattern'] }))}>{patterns.map(([value, ar, en]) => <option value={value} key={value}>{tr(ar,en)}</option>)}</select></label>
    <fieldset className="space-y-2"><legend className="text-xs font-bold text-zinc-300">{tr('المعدات المتاحة (اختر واحدة على الأقل)', 'Available equipment (select at least one)')}</legend><div className="flex flex-wrap gap-3">{gear.map((item) => <label key={item} className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={form.available_equipment.includes(item)} onChange={() => toggleList('available_equipment', item)} />{label(item)}</label>)}</div></fieldset>
    <fieldset className="space-y-2"><legend className="text-xs font-bold text-zinc-300">{tr('حركات تريد استبعادها', 'Movements to exclude')}</legend><div className="flex flex-wrap gap-3">{avoids.map((item) => <label key={item} className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={form.avoid_movements.includes(item)} onChange={() => toggleList('avoid_movements', item)} />{label(item)}</label>)}</div></fieldset>
    <label className="flex items-center gap-2 text-sm text-amber-300"><input type="checkbox" checked={form.pain_reported} onChange={(e) => setForm((old) => ({ ...old, pain_reported: e.target.checked }))} />{tr('أبلغ عن ألم أثناء الحركة', 'I have pain during this movement')}</label>
    {!input && <p role="alert" className="text-xs text-amber-300">{tr('اختر معدة واحدة على الأقل.', 'Select at least one piece of equipment.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildExerciseSubstitutionOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('اعرض الخيارات', 'Show options')}</button><button type="button" onClick={() => { reset(); setForm(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
