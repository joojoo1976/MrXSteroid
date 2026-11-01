'use client';
/** Tool #118 - CNS Recovery Score (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type CNSRecoveryInput, type CNSRecoveryResult } from '@/lib/tools/engines/tool-118-cns-recovery-score';
import { buildCNSRecoveryOutput } from '@/lib/tools/adapters/tool-118-cns-recovery-score';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { CNSRecoveryInputSchema } from '@/lib/tools/schemas/tool-118-cns-recovery-score';
import i18nJson from '@/i18n/tool-118-cns-recovery-score.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-118-cns-recovery-score';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const SCALE_1_5 = [1, 2, 3, 4, 5] as const;
const PERF_TRENDS = ['improving', 'stable', 'declining'] as const;
const PERF_LABEL: Record<string, string> = { improving: 'perf_improving', stable: 'perf_stable', declining: 'perf_declining' };

interface DraftInputs {
  hrv_ms: number;
  hrv_baseline_ms: number;
  resting_hr_bpm: number;
  resting_hr_baseline_bpm: number;
  sleep_hours: number;
  sleep_quality: number;
  body_temp_c: number;
  body_temp_baseline_c: number;
  mood: number;
  energy_level: number;
  motivation: number;
  muscle_soreness: number;
  joint_pain: number;
  recent_performance_trend: CNSRecoveryInput['recent_performance_trend'];
  training_load_change_pct: number;
  days_since_deload: number;
  illness_recent: boolean;
  stress_level: number;
}

export default function Tool118CNSRecoveryScore() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    hrv_ms: 55,
    hrv_baseline_ms: 60,
    resting_hr_bpm: 58,
    resting_hr_baseline_bpm: 55,
    sleep_hours: 7.5,
    sleep_quality: 4,
    body_temp_c: 36.8,
    body_temp_baseline_c: 36.6,
    mood: 4,
    energy_level: 4,
    motivation: 4,
    muscle_soreness: 2,
    joint_pain: 1,
    recent_performance_trend: 'stable',
    training_load_change_pct: 0,
    days_since_deload: 10,
    illness_recent: false,
    stress_level: 2,
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

  const parsed = useMemo(() => CNSRecoveryInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as CNSRecoveryInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<CNSRecoveryInput, CNSRecoveryResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.hrv_current}
          <input type="number" min={10} max={300} step={1} value={inputs.hrv_ms} onChange={(e) => updateInput('hrv_ms', Number(e.target.value || 55))} className={INP} />
        </label>
        <label className={LBL}>{t.hrv_baseline}
          <input type="number" min={10} max={300} step={1} value={inputs.hrv_baseline_ms} onChange={(e) => updateInput('hrv_baseline_ms', Number(e.target.value || 60))} className={INP} />
        </label>
        <label className={LBL}>{t.rhr_current}
          <input type="number" min={30} max={150} step={1} value={inputs.resting_hr_bpm} onChange={(e) => updateInput('resting_hr_bpm', Number(e.target.value || 58))} className={INP} />
        </label>
        <label className={LBL}>{t.rhr_baseline}
          <input type="number" min={30} max={150} step={1} value={inputs.resting_hr_baseline_bpm} onChange={(e) => updateInput('resting_hr_baseline_bpm', Number(e.target.value || 55))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_hours}
          <input type="number" min={0} max={24} step={0.5} value={inputs.sleep_hours} onChange={(e) => updateInput('sleep_hours', Number(e.target.value || 7.5))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_quality}
          <select value={inputs.sleep_quality} onChange={(e) => updateInput('sleep_quality', Number(e.target.value))} className={SEL}>
            {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.body_temp.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? '°C' : '°F'})
          <input type="number" min={unitSystem === 'metric' ? 34 : 93.2} max={unitSystem === 'metric' ? 42 : 107.6} step={unitSystem === 'metric' ? 0.1 : 0.2} value={unitSystem === 'metric' ? inputs.body_temp_c : Number((inputs.body_temp_c * 9 / 5 + 32).toFixed(1))} onChange={(e) => { const value = Number(e.target.value || (unitSystem === 'metric' ? 36.8 : 98.2)); updateInput('body_temp_c', unitSystem === 'metric' ? value : (value - 32) * 5 / 9); }} className={INP} />
        </label>
        <label className={LBL}>{t.body_temp_baseline.replace(/\s*\([^)]*\)\s*$/, '')} ({unitSystem === 'metric' ? '°C' : '°F'})
          <input type="number" min={unitSystem === 'metric' ? 34 : 93.2} max={unitSystem === 'metric' ? 42 : 107.6} step={unitSystem === 'metric' ? 0.1 : 0.2} value={unitSystem === 'metric' ? inputs.body_temp_baseline_c : Number((inputs.body_temp_baseline_c * 9 / 5 + 32).toFixed(1))} onChange={(e) => { const value = Number(e.target.value || (unitSystem === 'metric' ? 36.6 : 97.9)); updateInput('body_temp_baseline_c', unitSystem === 'metric' ? value : (value - 32) * 5 / 9); }} className={INP} />
        </label>
      </div>

      <div className="mb-4 border-t border-zinc-800 pt-4">
        <h3 className="text-xs font-bold text-zinc-400 mb-2">{t.subjective_markers}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {(['mood', 'energy_level', 'motivation', 'muscle_soreness', 'joint_pain'] as const).map((field) => (
            <label key={field} className={LBL}>{t[field]}
              <select value={String(inputs[field])} onChange={(e) => updateInput(field, Number(e.target.value))} className={SEL}>
                {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          ))}
          <label className={LBL}>{t.performance_trend}
            <select value={inputs.recent_performance_trend ?? ''} onChange={(e) => updateInput('recent_performance_trend', e.target.value || undefined)} className={SEL}>
              <option value="">{t.select_trend}</option>
              {PERF_TRENDS.map((p) => <option key={p} value={p}>{t[PERF_LABEL[p]]}</option>)}
            </select>
          </label>
          <label className={LBL}>{t.load_change}
            <input type="number" min={-100} max={200} step={1} value={inputs.training_load_change_pct} onChange={(e) => updateInput('training_load_change_pct', Number(e.target.value || 0))} className={INP} />
          </label>
          <label className={LBL}>{t.days_deload}
            <input type="number" min={0} max={365} step={1} value={inputs.days_since_deload} onChange={(e) => updateInput('days_since_deload', Number(e.target.value || 10))} className={INP} />
          </label>
          <label className={LBL}>{t.illness_recent}
            <select value={inputs.illness_recent ? 'true' : 'false'} onChange={(e) => updateInput('illness_recent', e.target.value === 'true')} className={SEL}>
              <option value="false">{t.no}</option>
              <option value="true">{t.yes}</option>
            </select>
          </label>
          <label className={LBL}>{t.stress_level}
            <select value={inputs.stress_level} onChange={(e) => updateInput('stress_level', Number(e.target.value))} className={SEL}>
              {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as CNSRecoveryInput, buildCNSRecoveryOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ hrv_ms: 55, hrv_baseline_ms: 60, resting_hr_bpm: 58, resting_hr_baseline_bpm: 55, sleep_hours: 7.5, sleep_quality: 4, body_temp_c: 36.8, body_temp_baseline_c: 36.6, mood: 4, energy_level: 4, motivation: 4, muscle_soreness: 2, joint_pain: 1, recent_performance_trend: 'stable', training_load_change_pct: 0, days_since_deload: 10, illness_recent: false, stress_level: 2 }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Metric label={t.cns_score} value={`${result.cns_recovery_score}/100`} />
              <Metric label={t.data_coverage} value={`${result.data_coverage_pct}%`} />
              <Metric label={t.readiness} value={t[`readiness_${result.readiness_level}`]} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.factor_breakdown}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <Metric label={t.hrv_factor} value={`${result.factor_scores.hrv_score}`} />
              <Metric label={t.sleep_factor} value={`${result.factor_scores.sleep_score}`} />
              <Metric label={t.subjective_factor} value={`${result.factor_scores.subjective_score}`} />
              <Metric label={t.performance_factor} value={`${result.factor_scores.performance_score}`} />
              <Metric label={t.biometric_factor} value={`${result.factor_scores.biometric_score}`} />
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.interpretation}</h4>
              <p className="text-xs text-zinc-400">{result.interpretation}</p>
            </div>

            {result.risk_flags.length > 0 && (
              <div className="mt-3 text-[11px] text-amber-300">
                <p className="font-black mb-1">{t.risk_flags}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.risk_flags.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-3 text-[11px] text-lime-300">
              <p className="font-black mb-1">{t.recommendations}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {result.recommendations.map((r, i) => <li key={i}>{t[r] || r}</li>)}
              </ul>
            </div>
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
