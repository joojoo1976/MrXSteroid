'use client';
/** Tool #123 - Joint Stress & Connective Tissue Load Risk Index (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import type { JointStressInput, JointStressResult } from '@/lib/tools/engines/tool-123-joint-stress-connective-tissue-index';
import { buildJointStressOutput } from '@/lib/tools/adapters/tool-123-joint-stress-connective-tissue-index';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { JointStressInputSchema } from '@/lib/tools/schemas/tool-123-joint-stress-connective-tissue-index';
import i18nJson from '@/i18n/tool-123-joint-stress-connective-tissue-index.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-123-joint-stress-connective-tissue-index';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const JOINTS = ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine'] as const;
const JOINT_LABEL: Record<string, string> = {
  shoulder: 'joint_shoulder', elbow: 'joint_elbow', wrist: 'joint_wrist',
  hip: 'joint_hip', knee: 'joint_knee', ankle: 'joint_ankle', spine: 'joint_spine',
};
const ROM_OPTIONS = ['partial', 'full', 'extended'] as const;
const ROM_LABEL: Record<string, string> = { partial: 'rom_partial', full: 'rom_full', extended: 'rom_extended' };

interface DraftExercise {
  name: string;
  joint: JointStressInput['exercises'][0]['joint'];
  sets: number;
  reps: number;
  weight_kg: number;
  rpe: number;
  range_of_motion: JointStressInput['exercises'][0]['range_of_motion'];
}

interface DraftInputs {
  age: number;
  training_age_years: number;
  sleep_hours: number;
  protein_g_per_kg: number;
  collagen_intake_g: number;
  omega3_g: number;
  previous_injuries: string[];
  chronic_pain_joints: string[];
  exercises: DraftExercise[];
}

const DEFAULT_EXERCISE: DraftExercise = {
  name: '',
  joint: 'knee',
  sets: 3,
  reps: 10,
  weight_kg: 80,
  rpe: 8,
  range_of_motion: 'full',
};
const DEFAULT_INPUTS: DraftInputs = {
  age: 28, training_age_years: 3, sleep_hours: 8, protein_g_per_kg: 2,
  collagen_intake_g: 10, omega3_g: 2, previous_injuries: [], chronic_pain_joints: [], exercises: [{ ...DEFAULT_EXERCISE }],
};

const KG_PER_LB = 1 / 2.20462;

export default function Tool123JointStress() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>(DEFAULT_INPUTS);
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

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const updateExercise = (index: number, field: keyof DraftExercise, value: unknown) => {
    setInputs((p) => {
      const newEx = [...p.exercises];
      newEx[index] = { ...newEx[index], [field]: value } as DraftExercise;
      return { ...p, exercises: newEx };
    });
  };

  const addExercise = () => {
    setInputs((p) => ({ ...p, exercises: [...p.exercises, { ...DEFAULT_EXERCISE, name: `Exercise ${p.exercises.length + 1}` }] }));
  };

  const removeExercise = (index: number) => {
    if (inputs.exercises.length <= 1) return;
    setInputs((p) => ({ ...p, exercises: p.exercises.filter((_, i) => i !== index) }));
  };

  const updateArray = (field: keyof DraftInputs, value: string) => {
    setInputs((p) => ({ ...p, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };
  const displayLoad = (kg: number) => Number((unitSystem === 'metric' ? kg : kg / KG_PER_LB).toFixed(1));
  const storeLoad = (value: number) => Number((unitSystem === 'metric' ? value : value * KG_PER_LB).toFixed(3));
  const massUnit = unitSystem === 'metric' ? 'kg' : 'lb';

  const parsed = useMemo(() => JointStressInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as JointStressInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<JointStressInput, JointStressResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.profile_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={13} max={100} step={1} value={inputs.age} onChange={(e) => updateInput('age', Number(e.target.value || 28))} className={INP} />
        </label>
        <label className={LBL}>{t.training_age}
          <input data-r6-slider="true" type="number" min={0} max={30} step={1} value={inputs.training_age_years} onChange={(e) => updateInput('training_age_years', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_hours}
          <input data-r6-slider="true" type="number" min={4} max={12} step={0.5} value={inputs.sleep_hours} onChange={(e) => updateInput('sleep_hours', Number(e.target.value || 8))} className={INP} />
        </label>
        <label className={LBL}>{t.protein}
          <input data-r6-slider="true" type="number" min={0} max={5} step={0.1} value={inputs.protein_g_per_kg} onChange={(e) => updateInput('protein_g_per_kg', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.collagen}
          <input data-r6-slider="true" type="number" min={0} max={50} step={1} value={inputs.collagen_intake_g} onChange={(e) => updateInput('collagen_intake_g', Number(e.target.value || 10))} className={INP} />
        </label>
        <label className={LBL}>{t.omega3}
          <input data-r6-slider="true" type="number" min={0} max={10} step={0.1} value={inputs.omega3_g} onChange={(e) => updateInput('omega3_g', Number(e.target.value || 2))} className={INP} />
        </label>
        <label className={LBL}>{t.injuries}
          <input type="text" maxLength={500} value={inputs.previous_injuries.join(', ')} onChange={(e) => updateArray('previous_injuries', e.target.value)} className={INP} placeholder={t.injuries_placeholder} />
        </label>
        <label className={LBL}>{t.chronic_pain}
          <input type="text" maxLength={500} value={inputs.chronic_pain_joints.join(', ')} onChange={(e) => updateArray('chronic_pain_joints', e.target.value)} className={INP} placeholder={t.chronic_placeholder} />
        </label>
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
              <label className={LBL}>{t.name}
                <input type="text" maxLength={100} value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} className={INP} placeholder={t.name_placeholder} />
              </label>
              <label className={LBL}>{t.joint}
                <select value={ex.joint} onChange={(e) => updateExercise(idx, 'joint', e.target.value)} className={SEL}>
                  {JOINTS.map((j) => <option key={j} value={j}>{t[JOINT_LABEL[j]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.sets}
                <input data-r6-slider="true" type="number" min={1} max={20} step={1} value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value || 3))} className={INP} />
              </label>
              <label className={LBL}>{t.reps}
                <input data-r6-slider="true" type="number" min={1} max={50} step={1} value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value || 10))} className={INP} />
              </label>
              <label className={LBL}>{t.weight} ({massUnit})
                <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 500 : 1102} step={unitSystem === 'metric' ? 0.5 : 1} value={displayLoad(ex.weight_kg)} onChange={(e) => updateExercise(idx, 'weight_kg', storeLoad(Number(e.target.value || (unitSystem === 'metric' ? 80 : 176.4))))} className={INP} />
              </label>
              <label className={LBL}>{t.rpe}
                <input data-r6-slider="true" type="number" min={1} max={10} step={1} value={ex.rpe} onChange={(e) => updateExercise(idx, 'rpe', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
              </label>
              <label className={LBL}>{t.rom}
                <select value={ex.range_of_motion} onChange={(e) => updateExercise(idx, 'range_of_motion', e.target.value)} className={SEL}>
                  {ROM_OPTIONS.map((r) => <option key={r} value={r}>{t[ROM_LABEL[r]]}</option>)}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addExercise} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_exercise}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildJointStressOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب النتيجة' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ ...DEFAULT_INPUTS }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة الضبط' : 'Reset'}</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.overall_stress} value={`${result.overall_stress_index}`} />
              <Metric label={t.risk_level} value={t[`risk_${result.risk_level}`]} />
              <Metric label={t.ct_risk} value={`${result.connective_tissue_risk}%`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.joint_breakdown}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-1">{t.joint}</th>
                    <th className="pb-1">{t.stress_score}</th>
                    <th className="pb-1">{t.risk_level}</th>
                    <th className="pb-1">{t.cum_load}</th>
                    <th className="pb-1">{t.bio_factor}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.joint_breakdown).map(([joint, data]) => (
                    <tr key={joint} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                      <td className="py-1 font-bold text-lime-400">{t[`joint_${joint}`] || joint}</td>
                      <td className="py-1">{Math.round(data.stress_score)}</td>
                      <td className="py-1">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${data.risk_level === 'low' ? 'bg-emerald-500/20 text-emerald-400' : data.risk_level === 'moderate' ? 'bg-amber-500/20 text-amber-400' : data.risk_level === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {t[`risk_${data.risk_level}`]}
                        </span>
                      </td>
                      <td className="py-1">{displayLoad(data.cumulative_load_kg).toLocaleString()} {massUnit}</td>
                      <td className="py-1">{data.biomechanical_factor}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.ct_risk_label}</h3>
            <p className="text-xs text-zinc-400 mb-4">{result.connective_tissue_risk}% - {t[`risk_${result.risk_level === 'critical' ? 'critical' : result.risk_level === 'high' ? 'high' : result.risk_level === 'moderate' ? 'moderate' : 'low'}`]}</p>

            {result.risk_factors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.risk_factors}</h4>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300">
                  {result.risk_factors.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}

            {result.protective_factors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.protective_factors}</h4>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-300">
                  {result.protective_factors.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.recommendations}</h4>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-lime-300">
                  {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

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
      {output && <ToolOutputSummary output={output} locale={locale} />}

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
