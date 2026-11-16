'use client';
/**
 * components/tools/tool-042-estrogen-management.genius.tsx
 *
 * Tool 042 owns its twelve GENIUS-12 boxes. The order is FIXED and a box is
 * never hidden: a box with no approved content shows `NOT_AVAILABLE` with the
 * real reason instead of an invented sentence.
 *
 * Safety posture:
 *   - the engine result is the only source of numbers and of the AI-delta hint;
 *   - what-if and sensitivity re-run the SAME R6 pipeline with one value
 *     changed — they never estimate a result themselves;
 *   - the engine's existing warnings and limits are preserved and only mapped
 *     to localisation keys;
 *   - C4 (sources) and the clinical parts of C5 stay NOT_AVAILABLE until a
 *     specialist approves the wording;
 *   - box 11 (history) is blocked by the W18 storage decision and writes
 *     nothing;
 *   - the 1–5 rating is session-only and says so.
 */
import React, { useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { EstrogenInput } from '@/lib/tools/schemas/tool-042-estrogen-management';
import type {
  EstrogenManagementBuildOptions,
  EstrogenResult,
} from '@/lib/tools/r6/tool-042-estrogen-management-pipeline';
import { runEstrogenManagement } from '@/lib/tools/r6/tool-042-estrogen-management-pipeline';
import { requireTool } from '@/lib/tools/registry';
import i18nJson from '@/i18n/tool-042-estrogen-management.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import {
  TOOL_042_CROSS_TOOL_LINKS,
  TOOL_042_LIMITS,
  TOOL_042_SOURCES,
  TOOL_042_SYMPTOMS,
  actionLabelKey,
  bandLabelKey,
  buildEstrogenCsv,
  formatAiDelta,
  formatE2,
  symptomLabelKey,
  warningLabelKey,
  type Tool042Draft,
  type Tool042Symptom,
  type Tool042UiState,
} from '@/lib/tools/r6/tool-042-estrogen-management-contract';

type BoxSource = 'engine' | 'static' | 'not_available' | 'not_applicable';

interface BoxDefinition {
  n: number;
  id: string;
  titleKey: string;
  source: BoxSource;
  content: React.ReactNode;
}

interface ToolLink {
  slug: string;
  titleEn: string;
  titleAr: string;
}

export interface Tool042GeniusProps {
  locale: 'ar' | 'en';
  state: Tool042UiState;
  draft: Tool042Draft;
  input: EstrogenInput | null;
  output: ToolOutput<EstrogenResult> | null;
  options: EstrogenManagementBuildOptions;
  prevTool: ToolLink;
  nextTool: ToolLink;
}

const SOURCE_BADGES: Record<BoxSource, { en: string; ar: string; className: string }> = {
  engine: { en: 'engine', ar: 'المحرك', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  static: { en: 'static', ar: 'ثابت', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  not_applicable: { en: 'NOT_APPLICABLE', ar: 'غير منطبق', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

const BOX_TINT = [
  'bg-zinc-900/60 border-zinc-800',
  'bg-rose-950/20 border-rose-900',
  'bg-blue-950/20 border-blue-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-cyan-950/20 border-cyan-900',
  'bg-cyan-950/20 border-cyan-900',
  'bg-orange-950/20 border-orange-900',
  'bg-teal-950/20 border-teal-900',
  'bg-purple-950/20 border-purple-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-zinc-900/60 border-zinc-800',
  'bg-yellow-950/20 border-yellow-900',
];

const BAND_TONE: Record<string, string> = {
  low: 'text-cyan-300',
  optimal: 'text-lime-300',
  elevated: 'text-amber-300',
  high: 'text-red-300',
};

/** Localisation keys for the hand-entered cross-tool mapping. */
const CROSS_TOOL_KEYS: Record<string, { field: string; note: string; freshness: string }> = {
  'tool-006-estrogen-prolactin': {
    field: 'cross_tool_006_field',
    note: 'cross_tool_006_note',
    freshness: 'cross_tool_006_freshness',
  },
  'tool-023-trt-optimization': {
    field: 'cross_tool_023_field',
    note: 'cross_tool_023_note',
    freshness: 'cross_tool_023_freshness',
  },
};

interface Probe {
  id: string;
  label: string;
  band: string | null;
  delta: number | null;
  changed: boolean;
  error: boolean;
}

export default function Tool042Genius({
  locale,
  state,
  draft,
  input,
  output,
  options,
  prevTool,
  nextTool,
}: Tool042GeniusProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const result = output?.result ?? null;

  const bandLabel = (band: string): string => t[bandLabelKey(band)] ?? t.band_unknown;
  const actionLabel = (action: string): string => t[actionLabelKey(action)] ?? t.action_unknown;
  const bandTone = (band: string): string => BAND_TONE[band] ?? 'text-zinc-300';

  const symptomLabels = draft.symptoms.map((symptom) => t[symptomLabelKey(symptom)] ?? symptom);

  /* ── What-if / sensitivity: the same pipeline, one value changed ───────── */

  const clampE2 = (value: number): number =>
    Math.min(TOOL_042_LIMITS.e2Max, Math.max(TOOL_042_LIMITS.e2Min, value));

  const runProbe = (labelKey: string, changed: Partial<EstrogenInput>): Probe => {
    const label = t[labelKey] ?? labelKey;
    if (!input || !result) {
      return { id: labelKey, label, band: null, delta: null, changed: false, error: true };
    }
    const outcome = runEstrogenManagement(
      { ...input, ...changed },
      { ...options, snapshotType: 'submitted_snapshot' },
    );
    if (!outcome.ok) {
      return { id: labelKey, label, band: null, delta: null, changed: false, error: true };
    }
    const next = outcome.output.result;
    return {
      id: labelKey,
      label,
      band: next.band,
      delta: next.ai_delta_mg,
      changed:
        next.band !== result.band ||
        next.ai_delta_mg !== result.ai_delta_mg ||
        next.action !== result.action,
      error: false,
    };
  };

  const nextSymptom: Tool042Symptom | null =
    TOOL_042_SYMPTOMS.find((symptom) => !draft.symptoms.includes(symptom)) ?? null;

  const probes: Probe[] = [
    runProbe('box5_e2_up', input ? { e2_pg_ml: clampE2(input.e2_pg_ml + 5) } : {}),
    runProbe('box5_e2_down', input ? { e2_pg_ml: clampE2(input.e2_pg_ml - 5) } : {}),
    runProbe('box5_ai_toggle', input ? { taking_ai: !input.taking_ai } : {}),
    runProbe(
      'box5_symptom_add',
      input && nextSymptom ? { symptoms: [...input.symptoms, nextSymptom] } : {},
    ),
  ];

  const anyFlip = probes.some((probe) => probe.changed);

  /* ── C1 / Primary result ───────────────────────────────────────────────── */

  const renderPrimaryResult = (): React.ReactNode => (
    <div data-r6-core="c1" className="space-y-2 text-sm">
      {result ? (
        <>
          <p className="font-mono text-2xl font-black text-zinc-100">
            {formatE2(input?.e2_pg_ml ?? 0)}{' '}
            <span className="text-sm font-bold text-zinc-400">{t.unit_pg_ml}</span>
          </p>
          <p className={`text-xs font-bold ${bandTone(result.band)}`}>
            {t.band}: {bandLabel(result.band)}
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.optimal_range_label}:{' '}
            <span className="font-mono">
              {result.optimal_range.low}–{result.optimal_range.high} {t.unit_pg_ml}
            </span>
          </p>
          <p className="text-[11px] text-zinc-500">{t.reference_note}</p>
          <p className="text-[11px] text-zinc-400">
            {t.confidence}: <span className="font-bold">{t.confidence_not_assessed}</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.delta_label}:{' '}
            <span className="font-mono font-bold text-zinc-100">
              {formatAiDelta(result.ai_delta_mg)} {t.unit_mg_week}
            </span>
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.action_label}: <span className="font-bold text-zinc-100">{actionLabel(result.action)}</span>
          </p>
          <p className="text-[11px] text-amber-300">{t.prescriber_review_only}</p>
        </>
      ) : (
        <p className="text-xs text-zinc-400">
          {t.state_waiting} — {t.state_no_result}
        </p>
      )}
    </div>
  );

  /* ── C2 / How calculated ───────────────────────────────────────────────── */

  const renderHowCalculated = (): React.ReactNode => (
    <div data-r6-core="c2" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.formula_title}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_band}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_symptom}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_delta}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_action}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.inputs_used}</p>
        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-zinc-300">
          <li>
            {t.field_e2}: {draft.e2.trim() === '' ? t.box4_not_entered : `${draft.e2} ${t.unit_pg_ml}`}
          </li>
          <li>
            {t.field_weekly_test}:{' '}
            {draft.weeklyTest.trim() === '' ? t.box4_not_entered : `${draft.weeklyTest} ${t.unit_mg_week}`}
          </li>
          <li>
            {t.field_taking_ai}:{' '}
            {draft.takingAi === '' ? t.not_answered : draft.takingAi === 'yes' ? t.yes : t.no}
          </li>
          <li>
            {t.field_ai_dose}:{' '}
            {draft.takingAi === 'yes'
              ? draft.aiDose.trim() === ''
                ? t.box4_not_entered
                : `${draft.aiDose} ${t.unit_mg_week}`
              : t.no}
          </li>
          <li>
            {t.field_body_fat}: {draft.bodyFat.trim() === '' ? t.box4_not_entered : `${draft.bodyFat}%`}
          </li>
          <li>
            {t.field_symptoms}: {symptomLabels.length === 0 ? t.symptoms_none : symptomLabels.join(', ')}
          </li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.assumptions_title}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.assumptions_body}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.uncertainty_title}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.uncertainty_body}</p>
      </div>
    </div>
  );

  /* ── Box 4 / Inputs summary ────────────────────────────────────────────── */

  const renderInputsSummary = (): React.ReactNode => (
    <div data-r6-core="inputs" className="space-y-2 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_inputs_label}</p>
      <ul className="space-y-0.5 font-mono text-[11px] text-zinc-300">
        <li>{t.field_e2}: {draft.e2.trim() === '' ? t.box4_not_entered : `${draft.e2} ${t.unit_pg_ml}`}</li>
        <li>
          {t.field_weekly_test}:{' '}
          {draft.weeklyTest.trim() === '' ? t.box4_not_entered : `${draft.weeklyTest} ${t.unit_mg_week}`}
        </li>
        <li>
          {t.field_taking_ai}:{' '}
          {draft.takingAi === '' ? t.not_answered : draft.takingAi === 'yes' ? t.yes : t.no}
        </li>
        <li>
          {t.field_ai_dose}:{' '}
          {draft.takingAi === 'yes'
            ? draft.aiDose.trim() === ''
              ? t.box4_not_entered
              : `${draft.aiDose} ${t.unit_mg_week}`
            : t.no}
        </li>
        <li>{t.field_body_fat}: {draft.bodyFat.trim() === '' ? t.box4_not_entered : `${draft.bodyFat}%`}</li>
      </ul>
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_symptoms_label}</p>
      {symptomLabels.length === 0 ? (
        <p className="text-[11px] text-zinc-500">{t.symptoms_none}</p>
      ) : (
        <ul className="space-y-0.5 text-[11px] text-zinc-300">
          {symptomLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      )}
      {!input && <p className="text-[11px] text-zinc-500">{t.box4_waiting}</p>}
    </div>
  );

  /* ── Box 5 / What-if ───────────────────────────────────────────────────── */

  const renderWhatIf = (): React.ReactNode => (
    <div data-r6-core="what-if" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box5_intro}</p>
      <ul className="space-y-1">
        {probes.map((probe) => (
          <li key={probe.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{probe.label}</span>
            <span className="ms-2 text-zinc-400">
              {probe.error || probe.band === null
                ? t.box5_out_of_range
                : probe.changed
                  ? `${t.box5_current}: ${result ? bandLabel(result.band) : '—'} → ${bandLabel(probe.band)}`
                  : `${t.box5_current}: ${result ? bandLabel(result.band) : '—'} · ${t.box5_unchanged}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  /* ── Box 6 / Sensitivity ───────────────────────────────────────────────── */

  const renderSensitivity = (): React.ReactNode => (
    <div data-r6-core="sensitivity" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box6_intro}</p>
      <ul className="space-y-1">
        {probes.map((probe) => (
          <li key={probe.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{probe.label}</span>
            <span className="ms-2 text-zinc-400">
              {probe.error || probe.band === null
                ? t.box5_out_of_range
                : probe.changed
                  ? `${t.box6_effect_status}: ${result ? bandLabel(result.band) : '—'} → ${bandLabel(probe.band)}`
                  : t.box6_effect_no_status}
            </span>
          </li>
        ))}
      </ul>
      {!anyFlip && <p className="text-[11px] text-amber-300">{t.box6_no_single_change}</p>}
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  /* ── C3 / Warnings and safety ───────────────────────────────────────────── */

  const renderSafety = (): React.ReactNode => {
    const warnings = result?.warnings ?? [];
    const redFlags: string[] = [];
    if (result) {
      if (result.band === 'high') redFlags.push(t.red_flag_high);
      if ((input?.e2_pg_ml ?? 0) > TOOL_042_LIMITS.extremeE2) redFlags.push(t.red_flag_extreme);
      if (result.band === 'low' && input?.taking_ai && input.weekly_ai_dose_mg > 0) {
        redFlags.push(t.red_flag_ai_overshoot);
      }
    }

    return (
      <div data-r6-core="c3" className="space-y-2 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.warnings_title}</p>
          {warnings.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-300">{result ? t.no_warnings : t.state_waiting}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-amber-200">
              {warnings.map((code) => (
                <li key={code}>{t[warningLabelKey(code)] ?? t.warning_unknown}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.red_flags}</p>
          {!result ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.state_waiting}</p>
          ) : redFlags.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.no_warnings}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-red-300">
              {redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.referral_title}</p>
          <p className="mt-1 text-[11px] text-zinc-400">{t.referral_not_available}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
        </div>
      </div>
    );
  };

  /* ── Box 8 / Cross-tool ─────────────────────────────────────────────────── */

  const renderCrossTool = (): React.ReactNode => (
    <div data-r6-core="cross-tool" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box8_intro}</p>
      <ul className="space-y-2">
        {TOOL_042_CROSS_TOOL_LINKS.map((link) => {
          const linkTool = requireTool(link.targetToolId);
          const keys = CROSS_TOOL_KEYS[link.targetToolId];
          return (
            <li key={link.targetToolId} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
              <p className="font-bold text-zinc-200">{isAr ? linkTool.titleAr : linkTool.titleEn}</p>
              <p className="mt-1 text-zinc-400">
                <span className="font-bold">{t.box8_mapped_fields}:</span>{' '}
                {link.mappedFields
                  .map((field) => `${keys ? t[keys.field] : field.targetField} — ${keys ? t[keys.note] : field.note}`)
                  .join('; ')}
              </p>
              <p className="text-zinc-400">
                <span className="font-bold">{t.box8_freshness}:</span>{' '}
                {keys ? t[keys.freshness] : link.freshnessRule}
              </p>
              <p className="text-zinc-500">
                <span className="font-bold">{t.box8_link_note}:</span> {t.box8_transfer_manual}
              </p>
            </li>
          );
        })}
      </ul>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box8_prev_next}</p>
        <p className="mt-1 text-[11px] text-zinc-400">
          <a className="text-cyan-300 underline" href={`/smarttools/${prevTool.slug}`}>
            {isAr ? prevTool.titleAr : prevTool.titleEn}
          </a>
          {' · '}
          <a className="text-cyan-300 underline" href={`/smarttools/${nextTool.slug}`}>
            {isAr ? nextTool.titleAr : nextTool.titleEn}
          </a>
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          {t.box8_calculated_at}: {output ? output.calculatedAt : t.state_waiting}
        </p>
      </div>
      <p className="text-[11px] text-zinc-500">{t.box8_no_transfer}</p>
    </div>
  );

  /* ── C4 / Sources ───────────────────────────────────────────────────────── */

  const renderSources = (): React.ReactNode => (
    <div data-r6-core="c4" className="space-y-2 text-sm">
      <p className="text-xs font-bold text-zinc-200">{t.evidence_none}</p>
      <p className="text-[11px] text-zinc-400">{t.evidence_pending_review}</p>
      <p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
      {TOOL_042_SOURCES.length > 0 && (
        <ul className="space-y-1">
          {TOOL_042_SOURCES.map((source) => (
            <li key={source.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-cyan-300 underline"
              >
                {t[source.titleKey] ?? source.titleKey}
              </a>
              <p className="mt-1 text-zinc-400">
                {t.evidence_publisher}: {source.publisher} · {t.evidence_date}: {source.reviewedOn} ·{' '}
                {t.evidence_level}: {source.evidenceLevel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  /* ── C5 / Next actions + rating ─────────────────────────────────────────── */

  const renderNextActions = (): React.ReactNode => (
    <div data-r6-core="c5" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.next_step}</p>
        <p className="mt-1 text-xs text-zinc-300">{t.c5_not_available}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.do_not}</p>
        <p className="mt-1 text-xs text-zinc-200">{t.not_a_diagnosis}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.seek_care}</p>
        <p className="mt-1 text-xs text-zinc-300">{t.c5_not_available}</p>
      </div>
      <p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" data-r6-rating="session_only_not_saved">
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_rating}</p>
        <div className="mt-1 flex gap-1" role="group" aria-label={t.box12_rating_aria}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className={`rounded border px-2 py-0.5 text-xs font-bold ${
                rating === value
                  ? 'border-amber-400 bg-amber-400 text-slate-950'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">{t.box12_rating_not_saved}</p>
      </div>
    </div>
  );

  /* ── KPI ────────────────────────────────────────────────────────────────── */

  const kpi = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_e2}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">
          {result && input ? `${formatE2(input.e2_pg_ml)} ${t.unit_pg_ml}` : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_band}</span>
        <span className={`font-mono text-sm font-bold ${result ? bandTone(result.band) : 'text-zinc-300'}`}>
          {result ? bandLabel(result.band) : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_delta}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">
          {result ? `${formatAiDelta(result.ai_delta_mg)} ${t.unit_mg_week}` : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_action}</span>
        <span className="font-mono text-xs font-bold text-zinc-100">
          {result ? actionLabel(result.action) : '—'}
        </span>
      </div>
    </div>
  );

  /* ── Box 10 / Export ────────────────────────────────────────────────────── */

  const renderExport = (): React.ReactNode => (
    <div data-r6-core="export" className="space-y-2 text-sm">
      <p className="text-xs text-zinc-400">{t.box10_intro}</p>
      <button
        type="button"
        disabled={!result || !input}
        onClick={() => {
          if (!result || !input) return;
          if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
          const csv = buildEstrogenCsv(input, result, output?.calculatedAt ?? options.calculatedAt);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'tool-042-estrogen-management.csv';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
      >
        {t.box10_button}
      </button>
      <p className="text-[11px] text-zinc-500">{result ? t.box10_note : t.box10_unavailable}</p>
    </div>
  );

  const boxes: BoxDefinition[] = [
    {
      n: 1,
      id: 'kpi',
      titleKey: 'box1_title',
      source: 'engine',
      content: (
        <div className="space-y-2 text-sm">
          {kpi}
          <p className="text-[11px] text-zinc-500">{t.box1_note}</p>
        </div>
      ),
    },
    { n: 2, id: 'primary', titleKey: 'box2_title', source: 'engine', content: renderPrimaryResult() },
    { n: 3, id: 'calculated', titleKey: 'box3_title', source: 'static', content: renderHowCalculated() },
    { n: 4, id: 'inputs', titleKey: 'box4_title', source: 'static', content: renderInputsSummary() },
    { n: 5, id: 'what-if', titleKey: 'box5_title', source: 'engine', content: renderWhatIf() },
    { n: 6, id: 'sensitivity', titleKey: 'box6_title', source: 'engine', content: renderSensitivity() },
    { n: 7, id: 'safety', titleKey: 'box7_title', source: 'engine', content: renderSafety() },
    { n: 8, id: 'cross-tool', titleKey: 'box8_title', source: 'static', content: renderCrossTool() },
    { n: 9, id: 'sources', titleKey: 'box9_title', source: 'not_available', content: renderSources() },
    { n: 10, id: 'export', titleKey: 'box10_title', source: 'static', content: renderExport() },
    {
      n: 11,
      id: 'history',
      titleKey: 'box11_title',
      source: 'not_available',
      content: <p className="text-xs text-zinc-400">{t.box11_na}</p>,
    },
    { n: 12, id: 'next-actions', titleKey: 'box12_title', source: 'static', content: renderNextActions() },
  ];

  // CORE-5 in compact mode: the same renderers as the full page.
  const compactBoxes = [boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]];
  const visibleBoxes = compact ? compactBoxes : boxes;

  return (
    <section
      className="mt-8 space-y-4"
      aria-label={t.genius_section_label}
      data-r6-genius="tool-042"
      data-r6-genius-state={state}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{compact ? t.genius_title_compact : t.genius_title}</h2>
        <div className="flex gap-2" role="group" aria-label={t.genius_mode_label}>
          <button
            type="button"
            onClick={() => setCompact(true)}
            aria-pressed={compact}
            className={`rounded px-3 py-1 text-xs font-bold ${compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}
          >
            {t.genius_compact}
          </button>
          <button
            type="button"
            onClick={() => setCompact(false)}
            aria-pressed={!compact}
            className={`rounded px-3 py-1 text-xs font-bold ${!compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}
          >
            {t.genius_full}
          </button>
        </div>
      </div>

      {visibleBoxes.map((box) => {
        const badge = SOURCE_BADGES[box.source];
        return (
          <article
            key={box.id}
            data-r6-box={String(box.n)}
            data-r6-box-id={box.id}
            data-r6-box-source={box.source}
            className={`rounded border p-4 ${BOX_TINT[box.n - 1] ?? BOX_TINT[0]}`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">
                <span className="me-1 font-mono text-zinc-500">{box.n}.</span>
                {t[box.titleKey]}
              </h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
                {isAr ? badge.ar : badge.en}
              </span>
            </div>
            {box.content}
          </article>
        );
      })}
    </section>
  );
}
