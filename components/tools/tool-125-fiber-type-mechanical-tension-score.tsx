'use client';
/** Tool #125 - Fiber Type Adaptation & Mechanical Tension Score (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import type { FiberInput, FiberResult } from '@/lib/tools/engines/tool-125-fiber-type-mechanical-tension-score';
import { buildFiberOutput } from '@/lib/tools/adapters/tool-125-fiber-type-mechanical-tension-score';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { FiberInputSchema } from '@/lib/tools/schemas/tool-125-fiber-type-mechanical-tension-score';
import i18nJson from '@/i18n/tool-125-fiber-type-mechanical-tension-score.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-125-fiber-type-mechanical-tension-score';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const REP_RANGES = ['1-5', '6-10', '11-15', '16-20', '20+'] as const;
const REP_LABEL: Record<string, string> = {
  '1-5': 'rep_1_5', '6-10': 'rep_6_10', '11-15': 'rep_11_15', '16-20': 'rep_16_20', '20+': 'rep_20_plus',
};
const TEMPOS = ['explosive', 'controlled', 'slow_eccentric'] as const;
const TEMPO_LABEL: Record<string, string> = { explosive: 'tempo_explosive', controlled: 'tempo_controlled', slow_eccentric: 'tempo_slow_eccentric' };
const ROMS = ['partial', 'full', 'extended'] as const;
const ROM_LABEL: Record<string, string> = { partial: 'rom_partial', full: 'rom_full', extended: 'rom_extended' };
const INTENTS = ['speed', 'tension', 'pump'] as const;
const INTENT_LABEL: Record<string, string> = { speed: 'intent_speed', tension: 'intent_tension', pump: 'intent_pump' };

interface DraftInputs {
  age: number;
  sex: 'male' | 'female';
  height_cm: number;
  body_weight_kg: number;
  max_reps_225_bench: number;
  max_reps_135_squat: number;
  vertical_jump_cm: number;
  broad_jump_cm: number;
  sprint_30m_time: number;
  preferred_rep_range: FiberInput['preferred_rep_range'];
  enjoys_explosive_training: boolean;
  fatigues_quickly_high_reps: boolean;
  recovers_fast_between_sets: boolean;
  training_age_years: number;
  avg_weekly_volume_sets: number;
  avg_intensity_rpe: number;
  current_tempo: FiberInput['current_tempo'];
  current_rom: FiberInput['current_rom'];
  current_intent: FiberInput['current_intent'];
}

export default function Tool125FiberTypeTension() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    age: 28,
    sex: 'male',
    height_cm: 178,
    body_weight_kg: 80,
    max_reps_225_bench: 10,
    max_reps_135_squat: 15,
    vertical_jump_cm: 50,
    broad_jump_cm: 230,
    sprint_30m_time: 4.2,
    preferred_rep_range: '6-10',
    enjoys_explosive_training: true,
    fatigues_quickly_high_reps: false,
    recovers_fast_between_sets: true,
    training_age_years: 3,
    avg_weekly_volume_sets: 80,
    avg_intensity_rpe: 8,
    current_tempo: 'controlled',
    current_rom: 'full',
    current_intent: 'tension',
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

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const toggleBool = (field: 'enjoys_explosive_training' | 'fatigues_quickly_high_reps' | 'recovers_fast_between_sets') => {
    setInputs((p) => ({ ...p, [field]: !p[field] }));
  };
  const displayMass = (kg: number) => Number((unitSystem === 'metric' ? kg : kg * 2.20462).toFixed(1));
  const storeMass = (value: number) => Number((unitSystem === 'metric' ? value : value / 2.20462).toFixed(3));
  const displayLength = (cm: number) => Number((unitSystem === 'metric' ? cm : cm / 2.54).toFixed(1));
  const storeLength = (value: number) => Number((unitSystem === 'metric' ? value : value * 2.54).toFixed(2));
  const lengthUnit = unitSystem === 'metric' ? 'cm' : 'in';
  const massUnit = unitSystem === 'metric' ? 'kg' : 'lb';

  const parsed = useMemo(() => FiberInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as FiberInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<FiberInput, FiberResult>(validInput);
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
          <input type="number" min={13} max={100} step={1} value={inputs.age} onChange={(e) => updateInput('age', Number(e.target.value || 28))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => updateInput('sex', e.target.value)} className={SEL}>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        <label className={LBL}>{t.height} ({lengthUnit})
          <input type="number" min={unitSystem === 'metric' ? 100 : 39.4} max={unitSystem === 'metric' ? 250 : 98.4} step={1} value={displayLength(inputs.height_cm)} onChange={(e) => updateInput('height_cm', storeLength(Number(e.target.value || (unitSystem === 'metric' ? 178 : 70.1))))} className={INP} />
        </label>
        <label className={LBL}>{t.body_weight} ({massUnit})
          <input type="number" min={unitSystem === 'metric' ? 30 : 66} max={unitSystem === 'metric' ? 300 : 661} step={unitSystem === 'metric' ? 0.1 : 0.5} value={displayMass(inputs.body_weight_kg)} onChange={(e) => updateInput('body_weight_kg', storeMass(Number(e.target.value || (unitSystem === 'metric' ? 80 : 176.4))))} className={INP} />
        </label>
        <label className={LBL}>{t.training_age}
          <input type="number" min={0} max={30} step={1} value={inputs.training_age_years} onChange={(e) => updateInput('training_age_years', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.avg_volume}
          <input type="number" min={0} max={200} step={1} value={inputs.avg_weekly_volume_sets} onChange={(e) => updateInput('avg_weekly_volume_sets', Number(e.target.value || 80))} className={INP} />
        </label>
        <label className={LBL}>{t.avg_rpe}
          <input type="number" min={1} max={10} step={0.1} value={inputs.avg_intensity_rpe} onChange={(e) => updateInput('avg_intensity_rpe', Number(e.target.value || 8))} className={INP} />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.performance_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.max_reps_bench}
          <input type="number" min={0} max={100} step={1} value={inputs.max_reps_225_bench} onChange={(e) => updateInput('max_reps_225_bench', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.max_reps_squat}
          <input type="number" min={0} max={100} step={1} value={inputs.max_reps_135_squat} onChange={(e) => updateInput('max_reps_135_squat', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.vertical_jump} ({lengthUnit})
          <input type="number" min={1} max={unitSystem === 'metric' ? 100 : 39.4} step={1} value={inputs.vertical_jump_cm === undefined ? '' : displayLength(inputs.vertical_jump_cm)} onChange={(e) => updateInput('vertical_jump_cm', e.target.value ? storeLength(Number(e.target.value)) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.broad_jump} ({lengthUnit})
          <input type="number" min={1} max={unitSystem === 'metric' ? 400 : 157.5} step={1} value={inputs.broad_jump_cm === undefined ? '' : displayLength(inputs.broad_jump_cm)} onChange={(e) => updateInput('broad_jump_cm', e.target.value ? storeLength(Number(e.target.value)) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.sprint_30m}
          <input type="number" min={2} max={10} step={0.1} value={inputs.sprint_30m_time} onChange={(e) => updateInput('sprint_30m_time', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.preferences_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.pref_rep_range}
          <select value={inputs.preferred_rep_range} onChange={(e) => updateInput('preferred_rep_range', e.target.value)} className={SEL}>
            {REP_RANGES.map((r) => <option key={r} value={r}>{t[REP_LABEL[r]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.current_tempo}
          <select value={inputs.current_tempo} onChange={(e) => updateInput('current_tempo', e.target.value)} className={SEL}>
            {TEMPOS.map((tp) => <option key={tp} value={tp}>{t[TEMPO_LABEL[tp]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.current_rom}
          <select value={inputs.current_rom} onChange={(e) => updateInput('current_rom', e.target.value)} className={SEL}>
            {ROMS.map((r) => <option key={r} value={r}>{t[ROM_LABEL[r]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.current_intent}
          <select value={inputs.current_intent} onChange={(e) => updateInput('current_intent', e.target.value)} className={SEL}>
            {INTENTS.map((i) => <option key={i} value={i}>{t[INTENT_LABEL[i]]}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.enjoys_explosive_training} onChange={() => toggleBool('enjoys_explosive_training')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.enjoys_explosive}</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.fatigues_quickly_high_reps} onChange={() => toggleBool('fatigues_quickly_high_reps')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.fatigues_high}</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.recovers_fast_between_sets} onChange={() => toggleBool('recovers_fast_between_sets')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.recovers_fast}</span>
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.strength_tests}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className={LBL}>{t.max_reps_bench}
          <input type="number" min={0} max={100} step={1} value={inputs.max_reps_225_bench} onChange={(e) => updateInput('max_reps_225_bench', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.max_reps_squat}
          <input type="number" min={0} max={100} step={1} value={inputs.max_reps_135_squat} onChange={(e) => updateInput('max_reps_135_squat', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.vertical_jump} ({lengthUnit})
          <input type="number" min={1} max={unitSystem === 'metric' ? 100 : 39.4} step={1} value={inputs.vertical_jump_cm === undefined ? '' : displayLength(inputs.vertical_jump_cm)} onChange={(e) => updateInput('vertical_jump_cm', e.target.value ? storeLength(Number(e.target.value)) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.broad_jump} ({lengthUnit})
          <input type="number" min={1} max={unitSystem === 'metric' ? 400 : 157.5} step={1} value={inputs.broad_jump_cm === undefined ? '' : displayLength(inputs.broad_jump_cm)} onChange={(e) => updateInput('broad_jump_cm', e.target.value ? storeLength(Number(e.target.value)) : undefined)} className={INP} placeholder="—" />
        </label>
        <label className={LBL}>{t.sprint_30m}
          <input type="number" min={2} max={10} step={0.1} value={inputs.sprint_30m_time} onChange={(e) => updateInput('sprint_30m_time', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.program_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.current_tempo}
          <select value={inputs.current_tempo} onChange={(e) => updateInput('current_tempo', e.target.value)} className={SEL}>
            {TEMPOS.map((tp) => <option key={tp} value={tp}>{t[TEMPO_LABEL[tp]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.current_rom}
          <select value={inputs.current_rom} onChange={(e) => updateInput('current_rom', e.target.value)} className={SEL}>
            {ROMS.map((r) => <option key={r} value={r}>{t[ROM_LABEL[r]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.current_intent}
          <select value={inputs.current_intent} onChange={(e) => updateInput('current_intent', e.target.value)} className={SEL}>
            {INTENTS.map((i) => <option key={i} value={i}>{t[INTENT_LABEL[i]]}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.enjoys_explosive_training} onChange={() => toggleBool('enjoys_explosive_training')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.enjoys_explosive}</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.fatigues_quickly_high_reps} onChange={() => toggleBool('fatigues_quickly_high_reps')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.fatigues_high}</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={inputs.recovers_fast_between_sets} onChange={() => toggleBool('recovers_fast_between_sets')} className="w-4 h-4 rounded border-zinc-700" />
          <span>{t.recovers_fast}</span>
        </label>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildFiberOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب النتيجة' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ age: 28, sex: 'male', height_cm: 178, body_weight_kg: 80, max_reps_225_bench: 10, max_reps_135_squat: 15, vertical_jump_cm: 50, broad_jump_cm: 230, sprint_30m_time: 4.2, preferred_rep_range: '6-10', enjoys_explosive_training: true, fatigues_quickly_high_reps: false, recovers_fast_between_sets: true, training_age_years: 3, avg_weekly_volume_sets: 80, avg_intensity_rpe: 8, current_tempo: 'controlled', current_rom: 'full', current_intent: 'tension' }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة الضبط' : 'Reset'}</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.fiber_distribution}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.type_I} value={`${result.estimated_fiber_distribution.type_I_pct}%`} />
              <Metric label={t.type_IIa} value={`${result.estimated_fiber_distribution.type_IIa_pct}%`} />
              <Metric label={t.type_IIx} value={`${result.estimated_fiber_distribution.type_IIx_pct}%`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.dominance}</h3>
            <Metric label={t.fiber_dominance} value={t[`fiber_${result.fiber_type_dominance}`]} />

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.tension_score}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.tension_score} value={`${result.mechanical_tension_score}/100`} />
              <Metric label={t.tension_effectiveness} value={t[`tension_${result.tension_effectiveness}`]} />
              <Metric label={t.shift_potential} value={t[`shift_${result.fiber_type_shift_potential}`]} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.recommendations_section}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Metric label={t.rec_rep_range} value={t[`rep_${result.recommended_rep_range}`]} />
              <Metric label={t.rec_tempo} value={t[`tempo_${result.recommended_tempo}`]} />
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.training_recommendations}</h4>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-lime-300">
                {result.training_recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
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
