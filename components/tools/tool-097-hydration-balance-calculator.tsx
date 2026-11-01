'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateHydrationBalance, type HydrationBalanceCalculatorResult } from '@/lib/tools/engines/tool-097-hydration-balance-calculator';
import { buildHydrationBalanceCalculatorOutput } from '@/lib/tools/adapters/tool-097-hydration-balance-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { HydrationBalanceCalculatorInputSchema, type HydrationBalanceCalculatorInput } from '@/lib/tools/schemas/tool-097-hydration-balance-calculator';
import i18nJson from '@/i18n/tool-097-hydration-balance-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-097-hydration-balance-calculator';
const KG_PER_LB = 1 / 2.2046226218;
const LITERS_PER_US_FL_OZ = 1 / 33.8140227;

type DraftInputs = Record<keyof HydrationBalanceCalculatorInput, string>;

const EMPTY_INPUTS: DraftInputs = {
  pre_exercise_body_weight_kg: '',
  post_exercise_body_weight_kg: '',
  fluid_consumed_liters: '',
  urine_output_liters: '',
  exercise_duration_minutes: '',
};

const INPUT_FIELDS: Array<{
  key: keyof DraftInputs;
  labelKey: keyof typeof i18nJson.en;
  kind: 'weight' | 'volume' | 'duration';
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'pre_exercise_body_weight_kg', labelKey: 'pre_weight', kind: 'weight', min: 1, max: 500, step: 0.1 },
  { key: 'post_exercise_body_weight_kg', labelKey: 'post_weight', kind: 'weight', min: 1, max: 500, step: 0.1 },
  { key: 'fluid_consumed_liters', labelKey: 'fluid_consumed', kind: 'volume', min: 0, max: 100, step: 0.01 },
  { key: 'urine_output_liters', labelKey: 'urine_output', kind: 'volume', min: 0, max: 100, step: 0.01 },
  { key: 'exercise_duration_minutes', labelKey: 'duration', kind: 'duration', min: 1, max: 1440, step: 1 },
];

function readCanonicalInput(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isDraftInputs(value: unknown): value is DraftInputs {
  if (typeof value !== 'object' || value === null) return false;
  return INPUT_FIELDS.every(({ key }) => {
    const field = (value as Record<string, unknown>)[key];
    return typeof field === 'string' || typeof field === 'number';
  });
}

export default function Tool097HydrationBalanceCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>(EMPTY_INPUTS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const prevDraftKey = useRef('');
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const isImperial = unitSystem === 'imperial';
  const weightUnit = isImperial ? t.unit_lb : t.unit_kg;
  const volumeUnit = isImperial ? t.unit_fl_oz : t.unit_liter;
  const rateUnit = isImperial ? t.unit_fl_oz_per_hour : t.unit_liter_per_hour;

  useEffect(() => {
    const draft = loadDraft<unknown>(TOOL_SLUG);
    const draftInputs = draft?.inputs;
    if (isDraftInputs(draftInputs)) {
      const restored = Object.fromEntries(INPUT_FIELDS.map(({ key }) => [key, String(draftInputs[key])])) as DraftInputs;
      setInputs(restored);
    }
  }, []);

  const isComplete = INPUT_FIELDS.every(({ key }) => inputs[key].trim() !== '');
  const parsedInput = useMemo(() => HydrationBalanceCalculatorInputSchema.safeParse({
    pre_exercise_body_weight_kg: readCanonicalInput(inputs.pre_exercise_body_weight_kg),
    post_exercise_body_weight_kg: readCanonicalInput(inputs.post_exercise_body_weight_kg),
    fluid_consumed_liters: readCanonicalInput(inputs.fluid_consumed_liters),
    urine_output_liters: readCanonicalInput(inputs.urine_output_liters),
    exercise_duration_minutes: readCanonicalInput(inputs.exercise_duration_minutes),
  }), [inputs]);

  const result = useMemo<HydrationBalanceCalculatorResult | null>(
    () => parsedInput.success ? calculateHydrationBalance(parsedInput.data) : null,
    [parsedInput],
  );

  useEffect(() => {
    const key = `${JSON.stringify(inputs)}:${locale}:${unitSystem}`;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale, unitSystem]);

  const displayCanonical = (value: string, kind: 'weight' | 'volume' | 'duration') => {
    if (value.trim() === '') return '';
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    if (kind === 'weight' && isImperial) return String(Number((number / KG_PER_LB).toFixed(1)));
    if (kind === 'volume' && isImperial) return String(Number((number / LITERS_PER_US_FL_OZ).toFixed(1)));
    return value;
  };

  const canonicalFromDisplay = (value: string, kind: 'weight' | 'volume' | 'duration') => {
    if (value === '') return '';
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    if (kind === 'weight' && isImperial) return String(number * KG_PER_LB);
    if (kind === 'volume' && isImperial) return String(number * LITERS_PER_US_FL_OZ);
    return value;
  };

  const formatFluid = (liters: number, decimals = 2) => {
    const value = isImperial ? liters / LITERS_PER_US_FL_OZ : liters;
    return Number(value.toFixed(decimals));
  };

  const handleSave = async () => {
    if (!parsedInput.success || !result || result.status !== 'CALCULATED') {
      setSaveStatus(result?.status === 'NOT_AVAILABLE' ? t.inconsistent_measurements : t.complete_inputs);
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildHydrationBalanceCalculatorOutput(parsedInput.data, {
        locale, unitSystem, snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC',
      });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsedInput.data);
      if (submitted.ok && projection.ok) {
        await clearDraft(TOOL_SLUG);
        setSaveStatus(t.saved);
      } else {
        setSaveStatus(t.save_failed);
      }
    } catch {
      setSaveStatus(t.save_failed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="mb-5">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">{t.scope}</p>
      </header>

      <section aria-label={t.measurements} className="grid grid-cols-1 gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:grid-cols-2">
        {INPUT_FIELDS.map(({ key, labelKey, kind, min, max, step }) => {
          const unit = kind === 'weight' ? weightUnit : kind === 'volume' ? volumeUnit : t.unit_minute;
          const displayMin = kind === 'weight' && isImperial ? Number((min / KG_PER_LB).toFixed(1))
            : kind === 'volume' && isImperial ? Number((min / LITERS_PER_US_FL_OZ).toFixed(1)) : min;
          const displayMax = kind === 'weight' && isImperial ? Number((max / KG_PER_LB).toFixed(1))
            : kind === 'volume' && isImperial ? Number((max / LITERS_PER_US_FL_OZ).toFixed(1)) : max;
          return (
            <label key={key} className="text-sm font-semibold text-zinc-300">
              {t[labelKey]} ({unit})
              <input
                aria-label={`${t[labelKey]} (${unit})`}
                aria-invalid={isComplete && !parsedInput.success}
                type="number"
                min={displayMin}
                max={displayMax}
                step={kind === 'weight' && isImperial ? 0.1 : kind === 'volume' && isImperial ? 0.1 : step}
                value={displayCanonical(inputs[key], kind)}
                onChange={(event) => setInputs((current) => ({
                  ...current,
                  [key]: canonicalFromDisplay(event.target.value, kind),
                }))}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-white"
              />
            </label>
          );
        })}
      </section>

      <p role="status" className="mt-3 text-sm text-zinc-300" data-testid="tool-097-status">
        {!isComplete ? t.complete_inputs : !parsedInput.success ? t.invalid_inputs
          : result?.status === 'NOT_AVAILABLE' ? t.inconsistent_measurements : t.result_calculated}
      </p>

      {result?.status === 'CALCULATED' && (
        <section aria-label={t.results} className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="block text-sm text-zinc-400">{t.sweat_loss}</span>
              <strong className="mt-2 block text-3xl font-black font-mono text-white">{formatFluid(result.sweat_loss_liters)}</strong>
              <span className="text-xs text-zinc-400">{volumeUnit}</span>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="block text-sm text-zinc-400">{t.sweat_rate}</span>
              <strong className="mt-2 block text-3xl font-black font-mono text-white">{formatFluid(result.sweat_rate_liters_per_hour)}</strong>
              <span className="text-xs text-zinc-400">{rateUnit}</span>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
            <span className="font-semibold">{t.formulaTitle} </span>
            {t.formula}
          </p>
          <p className="mt-3 text-sm text-amber-200">{t.limits}</p>
          <p className="mt-3 text-xs text-zinc-400">
            {t.sourceLabel}{' '}
            <a className="underline underline-offset-2 hover:text-lime-300" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5634236/" target="_blank" rel="noreferrer">
              {t.sourceTitle}
            </a>
          </p>
          <p className="mt-3 text-xs text-zinc-500">{t.disclaimer}</p>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-4 md:flex-row">
            <span className="text-xs text-zinc-400" aria-live="polite">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving} className="w-full rounded-lg bg-lime-500 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-400 disabled:opacity-50 md:w-auto">
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </section>
      )}

      {result?.status === 'NOT_AVAILABLE' && (
        <p role="alert" className="mt-4 rounded-xl border border-amber-700/60 bg-amber-950/30 p-4 text-sm text-amber-200">
          {t.inconsistent_measurements}
        </p>
      )}

      <p className="mt-4 text-xs text-zinc-500">{tool.toolId} · {t.calculatedOnly}</p>
      <nav aria-label={t.toolNavigation} className="mt-6 flex flex-col justify-between gap-4 border-t border-zinc-800 pt-4 text-xs md:flex-row">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="text-zinc-400 hover:text-lime-400">← {isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Previous tool: ${neighbors.prevTool.titleEn}`}</a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="text-zinc-400 hover:text-lime-400">{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next tool: ${neighbors.nextTool.titleEn}`} →</a>
      </nav>
    </main>
  );
}
