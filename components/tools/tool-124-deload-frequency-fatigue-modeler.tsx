'use client';
/** Tool #124 - Deload Frequency & Fatigue Accumulation Modeler (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import type { DeloadInput, DeloadResult } from '@/lib/tools/engines/tool-124-deload-frequency-fatigue-modeler';
import { buildDeloadOutput } from '@/lib/tools/adapters/tool-124-deload-frequency-fatigue-modeler';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { DeloadInputSchema } from '@/lib/tools/schemas/tool-124-deload-frequency-fatigue-modeler';
import i18nJson from '@/i18n/tool-124-deload-frequency-fatigue-modeler.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-124-deload-frequency-fatigue-modeler';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const TRENDS = ['improving', 'stable', 'declining'] as const;
const TREND_LABEL: Record<string, string> = {
  improving: 'trend_improving', stable: 'trend_stable', declining: 'trend_declining',
};
const SCALE_1_5 = [1, 2, 3, 4, 5] as const;

interface DraftInputs {
  training_age_years: number;
  weekly_volume_sets: number;
  avg_weekly_rpe: number;
  frequency_per_week: number;
  age: number;
  sleep_hours: number;
  stress_level: number;
  hrv_trend: DeloadInput['hrv_trend'];
  rhr_trend: DeloadInput['rhr_trend'];
  sleep_quality_trend: DeloadInput['sleep_quality_trend'];
  performance_trend: DeloadInput['performance_trend'];
  mood_trend: DeloadInput['mood_trend'];
  soreness_level: number;
  joint_pain: number;
  last_deload_weeks_ago: number;
  planned_deload_frequency_weeks: number;
}

export default function Tool124DeloadModeler() {
  requireTool(TOOL_SLUG);
  const { locale } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    training_age_years: 3,
    weekly_volume_sets: 80,
    avg_weekly_rpe: 8,
    frequency_per_week: 4,
    age: 28,
    sleep_hours: 8,
    stress_level: 2,
    hrv_trend: 'stable',
    rhr_trend: 'stable',
    sleep_quality_trend: 'stable',
    performance_trend: 'improving',
    mood_trend: 'stable',
    soreness_level: 2,
    joint_pain: 1,
    last_deload_weeks_ago: 4,
    planned_deload_frequency_weeks: 6,
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

  const parsed = useMemo(() => DeloadInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data as DeloadInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<DeloadInput, DeloadResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <label className={LBL}>{t.training_age}
          <input data-r6-slider="true" type="number" min={0} max={30} step={1} value={inputs.training_age_years} onChange={(e) => updateInput('training_age_years', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.weekly_volume}
          <input data-r6-slider="true" type="number" min={0} max={300} step={1} value={inputs.weekly_volume_sets} onChange={(e) => updateInput('weekly_volume_sets', Number(e.target.value || 80))} className={INP} />
        </label>
        <label className={LBL}>{t.avg_rpe}
          <input data-r6-slider="true" type="number" min={1} max={10} step={0.1} value={inputs.avg_weekly_rpe} onChange={(e) => updateInput('avg_weekly_rpe', Number(e.target.value || 8))} className={INP} />
        </label>
        <label className={LBL}>{t.frequency}
          <input data-r6-slider="true" type="number" min={1} max={7} step={1} value={inputs.frequency_per_week} onChange={(e) => updateInput('frequency_per_week', Number(e.target.value || 4))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={13} max={100} step={1} value={inputs.age} onChange={(e) => updateInput('age', Number(e.target.value || 28))} className={INP} />
        </label>
        <label className={LBL}>{t.sleep}
          <input data-r6-slider="true" type="number" min={4} max={12} step={0.5} value={inputs.sleep_hours} onChange={(e) => updateInput('sleep_hours', Number(e.target.value || 8))} className={INP} />
        </label>
        <label className={LBL}>{t.stress}
          <select value={inputs.stress_level} onChange={(e) => updateInput('stress_level', Number(e.target.value))} className={SEL}>
            {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.hrv_trend}
          <select value={inputs.hrv_trend} onChange={(e) => updateInput('hrv_trend', e.target.value)} className={SEL}>
            {TRENDS.map((tr) => <option key={tr} value={tr}>{t[TREND_LABEL[tr]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.rhr_trend}
          <select value={inputs.rhr_trend} onChange={(e) => updateInput('rhr_trend', e.target.value)} className={SEL}>
            {TRENDS.map((tr) => <option key={tr} value={tr}>{t[TREND_LABEL[tr]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.sleep_quality_trend}
          <select value={inputs.sleep_quality_trend} onChange={(e) => updateInput('sleep_quality_trend', e.target.value)} className={SEL}>
            {TRENDS.map((tr) => <option key={tr} value={tr}>{t[TREND_LABEL[tr]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.performance_trend}
          <select value={inputs.performance_trend} onChange={(e) => updateInput('performance_trend', e.target.value)} className={SEL}>
            {TRENDS.map((tr) => <option key={tr} value={tr}>{t[TREND_LABEL[tr]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.mood_trend}
          <select value={inputs.mood_trend} onChange={(e) => updateInput('mood_trend', e.target.value)} className={SEL}>
            {TRENDS.map((tr) => <option key={tr} value={tr}>{t[TREND_LABEL[tr]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.soreness}
          <select value={inputs.soreness_level} onChange={(e) => updateInput('soreness_level', Number(e.target.value))} className={SEL}>
            {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.joint_pain}
          <select value={inputs.joint_pain} onChange={(e) => updateInput('joint_pain', Number(e.target.value))} className={SEL}>
            {SCALE_1_5.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.last_deload}
          <input data-r6-slider="true" type="number" min={0} max={52} step={1} value={inputs.last_deload_weeks_ago} onChange={(e) => updateInput('last_deload_weeks_ago', Number(e.target.value || 4))} className={INP} />
        </label>
        <label className={LBL}>{t.planned_deload}
          <input data-r6-slider="true" type="number" min={1} max={12} step={1} value={inputs.planned_deload_frequency_weeks} onChange={(e) => updateInput('planned_deload_frequency_weeks', Number(e.target.value || 6))} className={INP} />
        </label>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!validInput} onClick={() => validInput && calculate(validInput, buildDeloadOutput, locale)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب النتيجة' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ training_age_years: 3, weekly_volume_sets: 80, avg_weekly_rpe: 8, frequency_per_week: 4, age: 28, sleep_hours: 8, stress_level: 2, hrv_trend: 'stable', rhr_trend: 'stable', sleep_quality_trend: 'stable', performance_trend: 'improving', mood_trend: 'stable', soreness_level: 2, joint_pain: 1, last_deload_weeks_ago: 4, planned_deload_frequency_weeks: 6 }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة الضبط' : 'Reset'}</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.recommended_interval} value={`${result.recommended_deload_interval_weeks} wks`} />
              <Metric label={t.fatigue_index} value={`${result.current_fatigue_index}%`} />
              <Metric label={t.fatigue_trend} value={t[`trend_${result.fatigue_trend}`]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.weeks_until} value={result.weeks_until_deload === 0 ? t.now : `${result.weeks_until_deload} wks`} />
              <Metric label={t.deload_type} value={t[`deload_${result.deload_type}`]} />
              <Metric label={t.deload_duration} value={`${result.deload_duration_days} ${t.days}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.overreaching_risk} value={t[`risk_${result.risk_of_overreaching}`]} />
              <Metric label={t.marker_hrv} value={t[`marker_${result.marker_analysis.hrv}`]} />
              <Metric label={t.marker_rhr} value={t[`marker_${result.marker_analysis.rhr}`]} />
              <Metric label={t.marker_sleep} value={t[`marker_${result.marker_analysis.sleep}`]} />
              <Metric label={t.marker_perf} value={t[`marker_${result.marker_analysis.performance}`]} />
              <Metric label={t.marker_mood} value={t[`marker_${result.marker_analysis.mood}`]} />
              <Metric label={t.marker_soreness} value={t[`sore_${result.marker_analysis.soreness}`]} />
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
