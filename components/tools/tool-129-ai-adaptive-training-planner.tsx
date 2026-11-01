'use client';
import React, { useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { AdaptivePlannerInputSchema, type AdaptivePlannerInput } from '@/lib/tools/schemas/tool-129-ai-adaptive-training-planner';
import type { AdaptivePlannerResult } from '@/lib/tools/engines/tool-129-ai-adaptive-training-planner.v6';
import { buildPlannerOutput } from '@/lib/tools/adapters/tool-129-ai-adaptive-training-planner';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';

const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const goals = ['strength', 'hypertrophy', 'endurance', 'general'] as const;
const experience = ['beginner', 'intermediate', 'advanced'] as const;
const readinessOptions = ['low', 'moderate', 'high'] as const;
const equipmentOptions = ['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine'] as const;
const limitationOptions = ['no_squat', 'no_overhead', 'no_impact'] as const;
const initial: AdaptivePlannerInput = { goal: 'general', experience_level: 'beginner', sessions_per_week: 3, session_duration: 45, available_equipment: [], readiness: 'moderate', limitations: [] };

export default function Tool129AdaptivePlanner() {
  const { locale } = useToolDisplayPreferences();
  const [form, setForm] = useState<AdaptivePlannerInput>(initial);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const parsed = useMemo(() => AdaptivePlannerInputSchema.safeParse(form), [form]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<AdaptivePlannerInput, AdaptivePlannerResult>(validInput);
  const toggle = (field: 'available_equipment' | 'limitations', value: string) => setForm((p) => {
    const current = p[field] ?? [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    return { ...p, [field]: next };
  });
  const translate = (value: string) => ({ strength: t('قوة', 'Strength'), hypertrophy: t('تضخم عضلي', 'Hypertrophy'), endurance: t('تحمل', 'Endurance'), general: t('لياقة عامة', 'General fitness'), beginner: t('مبتدئ', 'Beginner'), intermediate: t('متوسط', 'Intermediate'), advanced: t('متقدم', 'Advanced'), low: t('منخفضة', 'Low'), moderate: t('متوسطة', 'Moderate'), high: t('مرتفعة', 'High'), barbell: t('بار', 'Barbell'), dumbbell: t('دمبل', 'Dumbbell'), bodyweight: t('وزن الجسم', 'Bodyweight'), cable: t('كابل', 'Cable'), machine: t('أجهزة', 'Machine'), no_squat: t('تجنب القرفصاء', 'Avoid squats'), no_overhead: t('تجنب الحركات فوق الرأس', 'Avoid overhead movements'), no_impact: t('تجنب الصدمات', 'Avoid impact') }[value] ?? value);
  const selectField = (label: string, value: string, values: readonly string[], change: (v: string) => void) => <label className="block text-xs text-zinc-300">{label}<select className={inputClass} value={value} onChange={(e) => change(e.target.value)}>{values.map((option) => <option value={option} key={option}>{translate(option)}</option>)}</select></label>;
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <header className="flex items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{t('مخطط تدريبي إرشادي', 'Training Outline Planner')}</h1><div className="flex gap-2"></div></header>
    <p className="text-sm text-zinc-400">{t('ينشئ قواعد ثابتة مخططًا أسبوعيًا مختصرًا؛ لا يوجد نموذج ذكاء اصطناعي أو وصفة تمرين مفصلة.', 'Fixed rules produce a brief weekly outline; no AI model or detailed exercise prescription is used.')}</p>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {selectField(t('الهدف', 'Goal'), form.goal, goals, (v) => setForm((p) => ({ ...p, goal: v as AdaptivePlannerInput['goal'] })))}
      {selectField(t('الخبرة', 'Experience'), form.experience_level, experience, (v) => setForm((p) => ({ ...p, experience_level: v as AdaptivePlannerInput['experience_level'] })))}
      {selectField(t('الجاهزية المبلغ عنها', 'Reported readiness'), form.readiness ?? 'moderate', readinessOptions, (v) => setForm((p) => ({ ...p, readiness: v as NonNullable<AdaptivePlannerInput['readiness']> })))}
      <label className="text-xs text-zinc-300">{t('جلسات أسبوعيًا', 'Sessions per week')}<input className={inputClass} type="number" min={1} max={7} step={1} value={form.sessions_per_week} onChange={(e) => setForm((p) => ({ ...p, sessions_per_week: Number(e.target.value) }))} /></label>
      <label className="text-xs text-zinc-300">{t('مدة الجلسة بالدقائق', 'Session duration (minutes)')}<input className={inputClass} type="number" min={15} max={180} step={5} value={form.session_duration} onChange={(e) => setForm((p) => ({ ...p, session_duration: Number(e.target.value) }))} /></label>
    </section>
    <section className="space-y-2"><h2 className="text-xs font-bold text-zinc-300">{t('المعدات المتاحة (اختر واحدة على الأقل)', 'Available equipment (select at least one)')}</h2><div className="flex flex-wrap gap-3">{equipmentOptions.map((item) => <label key={item} className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={form.available_equipment.includes(item)} onChange={() => toggle('available_equipment', item)} />{translate(item)}</label>)}</div></section>
    <section className="space-y-2"><h2 className="text-xs font-bold text-zinc-300">{t('القيود التي أدخلها المستخدم (اختيارية)', 'User-entered limitations (optional)')}</h2><div className="flex flex-wrap gap-3">{limitationOptions.map((item) => <label key={item} className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={(form.limitations ?? []).includes(item)} onChange={() => toggle('limitations', item)} />{translate(item)}</label>)}</div></section>
    {!validInput && <p role="alert" className="text-xs text-amber-300">{t('اختر معدات واضبط الجلسات والمدة ضمن النطاق.', 'Select equipment and keep sessions and duration in range.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildPlannerOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('أنشئ المخطط', 'Create outline')}</button><button type="button" onClick={() => { reset(); setForm(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
