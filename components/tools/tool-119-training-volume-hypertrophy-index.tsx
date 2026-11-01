'use client';
/** Tool #119 - Training Volume Load & Hypertrophy Index (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type VolumeInput, type VolumeResult } from '@/lib/tools/engines/tool-119-training-volume-hypertrophy-index';
import { buildVolumeOutput } from '@/lib/tools/adapters/tool-119-training-volume-hypertrophy-index';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { VolumeInputSchema } from '@/lib/tools/schemas/tool-119-training-volume-hypertrophy-index';
import i18nJson from '@/i18n/tool-119-training-volume-hypertrophy-index.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-119-training-volume-hypertrophy-index';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'lower_back'] as const;
const MUSCLE_LABEL: Record<string, string> = {
  chest: 'mg_chest', back: 'mg_back', shoulders: 'mg_shoulders',
  biceps: 'mg_biceps', triceps: 'mg_triceps', forearms: 'mg_forearms',
  quads: 'mg_quads', hamstrings: 'mg_hamstrings', glutes: 'mg_glutes',
  calves: 'mg_calves', abs: 'mg_abs', lower_back: 'mg_lower_back',
};

interface DraftExercise {
  exercise: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight_kg: number;
  rpe?: number;
  percent_1rm?: number;
  frequency_per_week: number;
}

interface DraftInputs {
  exercises: DraftExercise[];
}

const DEFAULT_EXERCISE: DraftExercise = {
  exercise: '',
  muscle_group: 'chest',
  sets: 3,
  reps: 10,
  weight_kg: 60,
  rpe: 8,
  percent_1rm: 75,
  frequency_per_week: 2,
};

export default function Tool119VolumeHypertrophy() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    exercises: [DEFAULT_EXERCISE],
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale, unitSystem]);

  const updateExercise = (index: number, field: keyof DraftExercise, value: unknown) => {
    setInputs((p) => {
      const newEx = [...p.exercises];
      newEx[index] = { ...newEx[index], [field]: value } as DraftExercise;
      return { ...p, exercises: newEx };
    });
  };

  const addExercise = () => {
    setInputs((p) => ({ ...p, exercises: [...p.exercises, { ...DEFAULT_EXERCISE, exercise: `Exercise ${p.exercises.length + 1}` }] }));
  };

  const removeExercise = (index: number) => {
    if (inputs.exercises.length <= 1) return;
    setInputs((p) => ({ ...p, exercises: p.exercises.filter((_, i) => i !== index) }));
  };

  const parsed = useMemo(() => VolumeInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as VolumeInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<VolumeInput, VolumeResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.exercises_section}</h2>
      <div className="space-y-3 mb-4">
        {inputs.exercises.map((ex, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.exercise} {idx + 1}</h3>
              {inputs.exercises.length > 1 && <button type="button" onClick={() => removeExercise(idx)} className="text-red-400 hover:text-red-300 text-xs">{t.remove}</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <label className={LBL}>{t.exercise_name}
                <input type="text" maxLength={100} value={ex.exercise} onChange={(e) => updateExercise(idx, 'exercise', e.target.value)} className={INP} placeholder={t.exercise_placeholder} />
              </label>
              <label className={LBL}>{t.muscle_group}
                <select value={ex.muscle_group} onChange={(e) => updateExercise(idx, 'muscle_group', e.target.value)} className={SEL}>
                  {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{t[MUSCLE_LABEL[m]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.sets}
                <input type="number" min={1} max={50} step={1} value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value || 3))} className={INP} />
              </label>
              <label className={LBL}>{t.reps}
                <input type="number" min={1} max={100} step={1} value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value || 10))} className={INP} />
              </label>
              <label className={LBL}>{t.weight.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? 'kg' : 'lb'})
                <input type="number" min={unitSystem === 'metric' ? 1 : 2.2} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={unitSystem === 'metric' ? ex.weight_kg : Number((ex.weight_kg * 2.20462).toFixed(1))} onChange={(e) => updateExercise(idx, 'weight_kg', Number((Number(e.target.value || (unitSystem === 'metric' ? 60 : 132)) / (unitSystem === 'metric' ? 1 : 2.20462)).toFixed(3)))} className={INP} />
              </label>
              <label className={LBL}>{t.rpe}
                <input type="number" min={1} max={10} step={1} value={ex.rpe} onChange={(e) => updateExercise(idx, 'rpe', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
              </label>
              <label className={LBL}>{t.percent_1rm}
                <input type="number" min={1} max={100} step={1} value={ex.percent_1rm} onChange={(e) => updateExercise(idx, 'percent_1rm', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
              </label>
              <label className={LBL}>{t.frequency}
                <input type="number" min={1} max={7} step={1} value={ex.frequency_per_week} onChange={(e) => updateExercise(idx, 'frequency_per_week', Number(e.target.value || 2))} className={INP} />
              </label>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addExercise} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_exercise}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as VolumeInput, buildVolumeOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ exercises: [{ ...DEFAULT_EXERCISE }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.total_volume} value={`${(unitSystem === 'metric' ? result.total_volume_load_kg : result.total_volume_load_kg * 2.20462).toLocaleString()} ${unitSystem === 'metric' ? 'kg' : 'lb'}`} />
              <Metric label={t.hypertrophy_index} value={`${result.hypertrophy_index}/100`} />
              <Metric label={t.muscle_groups} value={`${Object.keys(result.volume_by_muscle).length}`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.volume_by_muscle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {Object.entries(result.volume_by_muscle).map(([muscle, vol]) => (
                <Metric key={muscle} label={t[`mg_${muscle}`] || muscle} value={`${(unitSystem === 'metric' ? vol : vol * 2.20462).toLocaleString()} ${unitSystem === 'metric' ? 'kg' : 'lb'}`} />
              ))}
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.hypertrophy_scores}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {Object.entries(result.muscle_group_scores).map(([muscle, data]) => (
                <div key={muscle} className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                  <div className="text-[9px] text-zinc-500 font-bold uppercase">{t[`mg_${muscle}`] || muscle}</div>
                  <div className="text-sm text-lime-400 font-mono font-black">{data.hypertrophy_score}</div>
                  <div className="text-[9px] text-zinc-400">{t.h_score}</div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.frequency_analysis}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {Object.entries(result.frequency_analysis).map(([muscle, freq]) => (
                <div key={muscle} className={`rounded-lg p-2 ${freq.adequacy === 'low' ? 'bg-red-500/10 border-red-500/20' : freq.adequacy === 'moderate' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className="text-[9px] font-bold text-zinc-400">{t[`mg_${muscle}`] || muscle}</div>
                  <div className="text-sm font-black">{freq.frequency}/wk</div>
                  <div className={`text-[9px] font-bold ${freq.adequacy === 'low' ? 'text-red-400' : freq.adequacy === 'moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {t[`freq_${freq.adequacy}`]}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.intensity_dist}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Metric label={t.low_int} value={`${result.intensity_distribution.low}`} />
              <Metric label={t.mod_int} value={`${result.intensity_distribution.moderate}`} />
              <Metric label={t.high_int} value={`${result.intensity_distribution.high}`} />
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
