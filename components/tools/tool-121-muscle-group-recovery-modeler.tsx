'use client';
/** Tool #121 - Muscle Group Recovery Time-Course Modeler (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type RecoveryInput, type RecoveryResult } from '@/lib/tools/engines/tool-121-muscle-group-recovery-modeler';
import { buildRecoveryOutput } from '@/lib/tools/adapters/tool-121-muscle-group-recovery-modeler';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { RecoveryInputSchema } from '@/lib/tools/schemas/tool-121-muscle-group-recovery-modeler';
import i18nJson from '@/i18n/tool-121-muscle-group-recovery-modeler.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-121-muscle-group-recovery-modeler';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const MUSCLE_GROUPS = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'forearms', 'calves', 'abs', 'lower_back'] as const;
const MUSCLE_LABEL: Record<string, string> = {
  chest: 'mg_chest', back: 'mg_back', quads: 'mg_quads', hamstrings: 'mg_hamstrings',
  glutes: 'mg_glutes', shoulders: 'mg_shoulders', biceps: 'mg_biceps', triceps: 'mg_triceps',
  forearms: 'mg_forearms', calves: 'mg_calves', abs: 'mg_abs', lower_back: 'mg_lower_back',
};

const SCALE_1_5 = [1, 2, 3, 4, 5] as const;

interface DraftInputs {
  muscle_group: RecoveryInput['muscle_group'];
  sets: number;
  rpe: number;
  frequency_per_week: number;
  age: number;
  sleep_hours: number;
  protein_g_per_kg: number;
  stress_level: number;
  training_age_years: number;
}

export default function Tool121MuscleGroupRecovery() {
  requireTool(TOOL_SLUG);
  const { locale } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    muscle_group: 'chest',
    sets: 3,
    rpe: 8,
    frequency_per_week: 2,
    age: 28,
    sleep_hours: 8,
    protein_g_per_kg: 2,
    stress_level: 2,
    training_age_years: 3,
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const parsed = useMemo(() => RecoveryInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<RecoveryInput, RecoveryResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.muscle_group}
          <select value={inputs.muscle_group} onChange={(e) => updateInput('muscle_group', e.target.value)} className={SEL}>
            {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{t[MUSCLE_LABEL[m]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.sets}
          <input data-r6-slider="true" type="number" min={1} max={20} step={1} value={inputs.sets} onChange={(e) => updateInput('sets', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.rpe}
          <input data-r6-slider="true" type="number" min={1} max={10} step={1} value={inputs.rpe} onChange={(e) => updateInput('rpe', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.frequency}
          <input data-r6-slider="true" type="number" min={1} max={7} step={1} value={inputs.frequency_per_week} onChange={(e) => updateInput('frequency_per_week', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={13} max={100} step={1} value={inputs.age} onChange={(e) => updateInput('age', Number(e.target.value || 28))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_hours}
          <input data-r6-slider="true" type="number" min={4} max={12} step={0.5} value={inputs.sleep_hours} onChange={(e) => updateInput('sleep_hours', Number(e.target.value || 8))} className={INP} />
        </label>
        <label className={LBL}>{t.protein}
          <input data-r6-slider="true" type="number" min={0} max={5} step={0.1} value={inputs.protein_g_per_kg} onChange={(e) => updateInput('protein_g_per_kg', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.stress}
          <select value={inputs.stress_level} onChange={(e) => updateInput('stress_level', Number(e.target.value))} className={SEL}>
            {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.training_age}
          <input data-r6-slider="true" type="number" min={0} max={30} step={1} value={inputs.training_age_years} onChange={(e) => updateInput('training_age_years', Number(e.target.value || 3))} className={INP} />
        </label>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data, buildRecoveryOutput, locale)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ muscle_group: 'chest', sets: 3, rpe: 8, frequency_per_week: 2, age: 28, sleep_hours: 8, protein_g_per_kg: 2, stress_level: 2, training_age_years: 3 }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.estimated_hours} value={`${result.estimated_recovery_hours} h`} />
              <Metric label={t.estimated_days} value={`${result.estimated_recovery_days} d`} />
              <Metric label={t.next_readiness} value={`${result.next_session_readiness_pct}%`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.factor_breakdown}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.volume_factor} value={`${result.volume_factor}x`} />
              <Metric label={t.intensity_factor} value={`${result.intensity_factor}x`} />
              <Metric label={t.individual_factor} value={`${result.individual_factor}x`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.readiness_timeline}</h3>
            <div className="h-40 bg-zinc-950 border border-zinc-800 rounded-lg p-2 relative overflow-hidden">
              {result.readiness_timeline.map((point, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-lime-400 transition-all"
                  style={{
                    left: `${(point.hour / 168) * 100}%`,
                    transform: `translate(-50%, -50%) scale(${point.recovery_pct / 100})`,
                    opacity: point.recovery_pct / 100,
                  }}
                  title={`${point.hour}h: ${point.recovery_pct}%`}
                />
              ))}
              <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between text-[8px] text-zinc-500">
                <span>0h</span>
                <span>84h</span>
                <span>168h</span>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.next_readiness}</h4>
              <p className="text-xs text-zinc-400">{t.next_readiness_text} {result.next_session_readiness_pct}%</p>
            </div>

            {result.flags.length > 0 && (
              <div className="mt-3 text-[11px] text-amber-300">
                <p className="font-black mb-1">{t.flags_title}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.flags.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">&#9888; {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}
