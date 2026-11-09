'use client';
/** Tool #115 - Supplement Evidence & Bio-Stack Navigator (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type SupplementResult, type Supplement, type StudyType } from '@/lib/tools/engines/tool-115-supplement-evidence-bio-stack-navigator';
import { buildSupplementOutput } from '@/lib/tools/adapters/tool-115-supplement-evidence-bio-stack-navigator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { SupplementInputSchema } from '@/lib/tools/schemas/tool-115-supplement-evidence-bio-stack-navigator';
import i18nJson from '@/i18n/tool-115-supplement-evidence-bio-stack-navigator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import { z } from 'zod';

type SupplementInput = z.infer<typeof SupplementInputSchema>;

const TOOL_SLUG = 'tool-115-supplement-evidence-bio-stack-navigator';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const CATEGORIES = ['vitamin', 'mineral', 'amino_acid', 'herbal', 'prohormone', 'peptide', 'other'] as const;
const CAT_LABEL: Record<string, string> = {
  vitamin: 'cat_vitamin', mineral: 'cat_mineral', amino_acid: 'cat_amino_acid',
  herbal: 'cat_herbal', prohormone: 'cat_prohormone', peptide: 'cat_peptide', other: 'cat_other',
};
const STUDY_TYPES: StudyType[] = ['rct', 'meta_analysis', 'observational', 'animal', 'in_vitro', 'theoretical'];
const STUDY_LABEL: Record<StudyType, string> = {
  rct: 'study_rct', meta_analysis: 'study_meta', observational: 'study_obs',
  animal: 'study_animal', in_vitro: 'study_vitro', theoretical: 'study_theoretical',
};
const GRADE_LABEL: Record<string, { ar: string; en: string; color: string }> = {
  A: { ar: 'أ', en: 'A', color: 'bg-emerald-500/20 text-emerald-400' },
  B: { ar: 'ب', en: 'B', color: 'bg-lime-500/20 text-lime-400' },
  C: { ar: 'ج', en: 'C', color: 'bg-amber-500/20 text-amber-400' },
  D: { ar: 'د', en: 'D', color: 'bg-red-500/20 text-red-400' },
};

interface DraftStudy {
  type: StudyType;
  sample_size?: number;
  effect_size?: number;
  p_value?: number;
  quality_score?: number;
  outcome: string;
  year: number;
}

interface DraftSupplement {
  id: string;
  name: string;
  category: Supplement['category'];
  studies: DraftStudy[];
  claimed_benefits: string[];
  typical_dose: string;
  safety_notes: string;
}

interface DraftInputs {
  supplements: DraftSupplement[];
  goals: string[];
}

const DEFAULT_STUDY: DraftStudy = {
  type: 'rct',
  sample_size: 50,
  effect_size: 0.5,
  p_value: 0.03,
  quality_score: 5,
  outcome: '',
  year: 2020,
};

const DEFAULT_SUPP: DraftSupplement = {
  id: '',
  name: '',
  category: 'amino_acid',
  studies: [DEFAULT_STUDY],
  claimed_benefits: [],
  typical_dose: '',
  safety_notes: '',
};

const GOAL_OPTIONS = ['muscle_growth', 'fat_loss', 'recovery', 'strength', 'endurance', 'health', 'sleep', 'cognitive'];
const GOAL_LABEL: Record<string, string> = {
  muscle_growth: 'goal_muscle', fat_loss: 'goal_fat', recovery: 'goal_recovery',
  strength: 'goal_strength', endurance: 'goal_endurance', health: 'goal_health',
  sleep: 'goal_sleep', cognitive: 'goal_cognitive',
};

export default function Tool115SupplementNavigator() {
  requireTool(TOOL_SLUG);
  const { locale } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({ supplements: [DEFAULT_SUPP], goals: [] });
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

  const updateSupp = (index: number, field: keyof DraftSupplement, value: unknown) => {
    setInputs((p) => {
      const newSupps = [...p.supplements];
      newSupps[index] = { ...newSupps[index], [field]: value } as DraftSupplement;
      return { ...p, supplements: newSupps };
    });
  };

  const updateStudy = (suppIndex: number, studyIndex: number, field: keyof DraftStudy, value: unknown) => {
    setInputs((p) => {
      const newSupps = [...p.supplements];
      const newStudies = [...newSupps[suppIndex].studies];
      newStudies[studyIndex] = { ...newStudies[studyIndex], [field]: value } as DraftStudy;
      newSupps[suppIndex] = { ...newSupps[suppIndex], studies: newStudies };
      return { ...p, supplements: newSupps };
    });
  };

  const addStudy = (suppIndex: number) => {
    setInputs((p) => {
      const newSupps = [...p.supplements];
      newSupps[suppIndex] = { ...newSupps[suppIndex], studies: [...newSupps[suppIndex].studies, DEFAULT_STUDY] };
      return { ...p, supplements: newSupps };
    });
  };

  const removeStudy = (suppIndex: number, studyIndex: number) => {
    setInputs((p) => {
      const newSupps = [...p.supplements];
      if (newSupps[suppIndex].studies.length <= 1) return p;
      newSupps[suppIndex] = { ...newSupps[suppIndex], studies: newSupps[suppIndex].studies.filter((_, i) => i !== studyIndex) };
      return { ...p, supplements: newSupps };
    });
  };

  const addSupp = () => {
    setInputs((p) => ({ ...p, supplements: [...p.supplements, { ...DEFAULT_SUPP, id: `supp_${Date.now()}` }] }));
  };

  const removeSupp = (index: number) => {
    if (inputs.supplements.length <= 1) return;
    setInputs((p) => ({ ...p, supplements: p.supplements.filter((_, i) => i !== index) }));
  };

  const toggleGoal = (goal: string) => {
    setInputs((p) => ({
      ...p,
      goals: p.goals.includes(goal) ? p.goals.filter((g) => g !== goal) : [...p.goals, goal],
    }));
  };

  const toggleBenefit = (suppIndex: number, benefit: string) => {
    setInputs((p) => {
      const newSupps = [...p.supplements];
      const current = newSupps[suppIndex].claimed_benefits;
      newSupps[suppIndex] = {
        ...newSupps[suppIndex],
        claimed_benefits: current.includes(benefit) ? current.filter((b) => b !== benefit) : [...current, benefit],
      };
      return { ...p, supplements: newSupps };
    });
  };

  const parsed = useMemo(() => {
    const validationSupps = inputs.supplements
      .filter((s) => s.name.trim().length > 0)
      .map((s, index) => ({
        ...s,
        id: s.id || `supp_${index + 1}`,
        studies: s.studies.filter((st) => st.outcome.trim().length > 0),
      }));
    return SupplementInputSchema.safeParse({ supplements: validationSupps, goals: inputs.goals });
  }, [inputs]);

  const validInput = parsed.success ? parsed.data as SupplementInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<SupplementInput, SupplementResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.goals_section}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => toggleGoal(goal)}
            className={`px-3 py-1 text-xs font-bold rounded-lg border ${inputs.goals.includes(goal) ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
          >
            {t[GOAL_LABEL[goal]]}
          </button>
        ))}
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.supplements_section}</h2>
      <div className="space-y-3 mb-4">
        {inputs.supplements.map((supp, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.supplement} {idx + 1}</h3>
              {inputs.supplements.length > 1 && <button type="button" onClick={() => removeSupp(idx)} className="text-red-400 hover:text-red-300 text-xs">{t.remove}</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className={LBL}>{t.name}
                <input type="text" maxLength={100} value={supp.name} onChange={(e) => updateSupp(idx, 'name', e.target.value)} className={INP} placeholder={t.name_placeholder} />
              </label>
              <label className={LBL}>{t.category}
                <select value={supp.category} onChange={(e) => updateSupp(idx, 'category', e.target.value)} className={SEL}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t[CAT_LABEL[c]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.typical_dose}
                <input type="text" maxLength={100} value={supp.typical_dose} onChange={(e) => updateSupp(idx, 'typical_dose', e.target.value)} className={INP} placeholder={t.dose_placeholder} />
              </label>
              <label className={LBL}>{t.safety_notes}
                <input type="text" maxLength={500} value={supp.safety_notes} onChange={(e) => updateSupp(idx, 'safety_notes', e.target.value)} className={INP} placeholder={t.safety_placeholder} />
              </label>
            </div>

            <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.claimed_benefits}</h4>
            <div className="flex flex-wrap gap-1">
              {['muscle_growth', 'fat_loss', 'recovery', 'strength', 'endurance', 'health', 'sleep', 'cognitive', 'libido', 'joint_health', 'immune'].map((benefit) => (
                <button
                  key={benefit}
                  type="button"
                  onClick={() => toggleBenefit(idx, benefit)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${supp.claimed_benefits.includes(benefit) ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                >
                  {t[`benefit_${benefit}`] || benefit}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-400">{t.studies}</h4>
                <button type="button" onClick={() => addStudy(idx)} className="text-xs text-lime-400 hover:text-lime-300">{t.add_study}</button>
              </div>
              {supp.studies.map((study, studyIdx) => (
                <div key={studyIdx} className="grid grid-cols-1 md:grid-cols-3 gap-1 p-2 rounded bg-zinc-950 border border-zinc-800">
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.study_type}</span>
                    <select value={study.type} onChange={(e) => updateStudy(idx, studyIdx, 'type', e.target.value)} className={SEL}>
                      {STUDY_TYPES.map((st) => <option key={st} value={st}>{t[STUDY_LABEL[st]]}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-0.5 md:col-span-2" style={{ fontSize: '9px' }}>
                    <span>{t.outcome}</span>
                    <input type="text" maxLength={200} value={study.outcome} onChange={(e) => updateStudy(idx, studyIdx, 'outcome', e.target.value)} className={INP} placeholder={t.outcome_placeholder} />
                  </label>
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.sample_size}</span>
                    <input data-r6-slider="true" type="number" min={1} max={10000} step={1} value={study.sample_size ?? ''} onChange={(e) => updateStudy(idx, studyIdx, 'sample_size', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                  </label>
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.effect_size}</span>
                    <input type="number" step={0.01} value={study.effect_size ?? ''} onChange={(e) => updateStudy(idx, studyIdx, 'effect_size', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                  </label>
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.p_value}</span>
                    <input data-r6-slider="true" type="number" min={0} max={1} step={0.001} value={study.p_value ?? ''} onChange={(e) => updateStudy(idx, studyIdx, 'p_value', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                  </label>
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.quality_score}</span>
                    <input data-r6-slider="true" type="number" min={0} max={10} step={0.5} value={study.quality_score ?? ''} onChange={(e) => updateStudy(idx, studyIdx, 'quality_score', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                  </label>
                  <label className="flex flex-col gap-0.5" style={{ fontSize: '9px' }}>
                    <span>{t.year}</span>
                    <input data-r6-slider="true" type="number" min={1950} max={2030} step={1} value={study.year} onChange={(e) => updateStudy(idx, studyIdx, 'year', Number(e.target.value || 2020))} className={INP} />
                  </label>
                  {supp.studies.length > 1 && (
                    <button type="button" onClick={() => removeStudy(idx, studyIdx)} className="text-red-400 hover:text-red-300 text-xs self-center">{t.remove}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addSupp} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_supplement}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as SupplementInput, buildSupplementOutput, locale)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ goals: [], supplements: [{ ...DEFAULT_SUPP, studies: [{ ...DEFAULT_STUDY }], claimed_benefits: [] }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.evidence_grades}</h3>
            <div className="space-y-2 mb-4">
              {result.supplements.map((supp) => (
                <div key={supp.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lime-400">{supp.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${GRADE_LABEL[supp.evidence_grade].color}`}>
                      Grade {supp.evidence_grade}
                    </span>
                    <span className="text-zinc-400 text-[10px]">
                      {supp.total_studies} studies, {supp.rct_count} RCTs, {supp.meta_analysis_count} meta-analyses
                    </span>
                  </div>
                  <div className="text-zinc-500 text-[10px]">
                    {supp.evidence_summary}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.stack_analysis}</h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-zinc-400">{t.overall_synergy}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  result.stack_analysis.overall_synergy === 'synergistic' ? 'bg-emerald-500/20 text-emerald-400' :
                  result.stack_analysis.overall_synergy === 'antagonistic' ? 'bg-red-500/20 text-red-400' :
                  result.stack_analysis.overall_synergy === 'additive' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-zinc-500/20 text-zinc-400'
                }`}>
                  {t[`synergy_${result.stack_analysis.overall_synergy}`]}
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.pairwise_interactions}</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.stack_analysis.pairwise_interactions
                  .filter((p) => p.effect !== 'unknown' && p.effect !== 'neutral')
                  .map((pair, i) => (
                    <div key={i} className="text-[9px] p-1.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="font-bold text-lime-400">{pair.supplement_a}</span>
                      <span className="text-zinc-400"> × </span>
                      <span className="font-bold text-lime-400">{pair.supplement_b}</span>
                      <span className="text-zinc-400"> → </span>
                      <span className={`font-bold ${pair.effect === 'synergistic' ? 'text-emerald-400' : pair.effect === 'antagonistic' ? 'text-red-400' : pair.effect === 'additive' ? 'text-blue-400' : 'text-zinc-400'}`}>
                        {t[`synergy_${pair.effect}`]}
                      </span>
                      <span className="text-zinc-500 ml-2">({pair.risk} risk)</span>
                    </div>
                  ))}
                {result.stack_analysis.pairwise_interactions.every((p) => p.effect === 'unknown' || p.effect === 'neutral') && (
                  <p className="text-zinc-500 text-[10px]">{t.no_significant_interactions}</p>
                )}
              </div>
            </div>

            <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.goal_alignment}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {Object.entries(result.stack_analysis.goal_alignment).map(([goal, score]) => (
                <Metric key={goal} label={t[GOAL_LABEL[goal]] || goal} value={`${score}/100`} />
              ))}
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
