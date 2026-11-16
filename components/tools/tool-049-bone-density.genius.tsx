'use client';
/**
 * components/tools/tool-049-bone-density.genius.tsx
 *
 * Tool 049 owns its twelve GENIUS-12 boxes. The order is FIXED and a box is
 * never hidden: a box with no approved content shows `NOT_AVAILABLE` with the
 * real reason instead of an invented sentence.
 *
 * Safety posture:
 *   - the engine result is the only source of scores, bands, risk factors,
 *     interventions and warnings;
 *   - what-if and sensitivity re-run the SAME R6 pipeline with one value
 *     changed — they never estimate a result themselves;
 *   - the engine's risk factors and interventions are shown as the engine's
 *     informational categories, never as instructions or a prescription;
 *   - the engine is educational screening, explicitly NOT a DXA diagnosis, and
 *     the UI says so;
 *   - the legacy adapter's invented confidence (0.9) and invented reference
 *     range (0–100, "educational screening band") are NOT reused;
 *   - C4 (sources) and the clinical parts of C5 stay NOT_AVAILABLE until a
 *     specialist approves the wording;
 *   - box 11 (history) is blocked by the W18 storage decision and writes
 *     nothing;
 *   - the 1–5 rating is session-only and says so.
 */
import React, { useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { BoneDensityInput } from '@/lib/tools/schemas/tool-049-bone-density';
import type {
  BoneDensityBuildOptions,
  BoneDensityResult,
} from '@/lib/tools/r6/tool-049-bone-density-pipeline';
import { runBoneDensity } from '@/lib/tools/r6/tool-049-bone-density-pipeline';
import { requireTool } from '@/lib/tools/registry';
import i18nJson from '@/i18n/tool-049-bone-density.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import {
  TOOL_049_CROSS_TOOL_LINKS,
  TOOL_049_LIMITS,
  TOOL_049_SOURCES,
  bandLabelKey,
  buildBoneDensityCsv,
  formatScore,
  clamp,
  interventionLabelKey,
  mirroredScore,
  riskFactorLabelKey,
  scoreContributions,
  warningLabelKey,
  type Tool049Draft,
  type Tool049UiState,
} from '@/lib/tools/r6/tool-049-bone-density-contract';

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

export interface Tool049GeniusProps {
  locale: 'ar' | 'en';
  state: Tool049UiState;
  draft: Tool049Draft;
  input: BoneDensityInput | null;
  output: ToolOutput<BoneDensityResult> | null;
  options: BoneDensityBuildOptions;
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

const CROSS_TOOL_KEYS: Record<string, { field: string; note: string; freshness: string }> = {
  'tool-047-fertility-preservation': {
    field: 'cross_tool_047_field',
    note: 'cross_tool_047_note',
    freshness: 'cross_tool_047_freshness',
  },
  'tool-046-trt-lifetime': {
    field: 'cross_tool_046_field',
    note: 'cross_tool_046_note',
    freshness: 'cross_tool_046_freshness',
  },
};

interface Probe {
  id: string;
  label: string;
  score: number | null;
  band: string | null;
  changed: boolean;
  error: boolean;
}

export default function Tool049Genius({
  locale,
  state,
  draft,
  input,
  output,
  options,
  prevTool,
  nextTool,
}: Tool049GeniusProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const result = output?.result ?? null;

  const riskFactorLabel = (code: string): string => t[riskFactorLabelKey(code)] ?? t.rf_unknown;
  const interventionLabel = (code: string): string => t[interventionLabelKey(code)] ?? t.iv_unknown;
  const warningLabel = (code: string): string => t[warningLabelKey(code)] ?? t.warning_unknown;

  /* ── What-if / sensitivity: the same pipeline, one value changed ───────── */

  const runProbe = (labelKey: string, changed: Partial<BoneDensityInput>): Probe => {
    const label = t[labelKey] ?? labelKey;
    if (!input || !result) {
      return { id: labelKey, label, score: null, band: null, changed: false, error: true };
    }
    const outcome = runBoneDensity(
      { ...input, ...changed },
      { ...options, snapshotType: 'submitted_snapshot' },
    );
    if (!outcome.ok) {
      return { id: labelKey, label, score: null, band: null, changed: false, error: true };
    }
    const next = outcome.output.result;
    return {
      id: labelKey,
      label,
      score: next.bone_health_score,
      band: next.band,
      changed:
        next.bone_health_score !== result.bone_health_score ||
        next.band !== result.band ||
        next.risk_factors.join('|') !== result.risk_factors.join('|') ||
        next.interventions.join('|') !== result.interventions.join('|'),
      error: false,
    };
  };

  const probes: Probe[] = [
    runProbe(
      'box5_age_up',
      input ? { age: clamp(input.age + 5, TOOL_049_LIMITS.ageMin, TOOL_049_LIMITS.ageMax) } : {},
    ),
    runProbe(
      'box5_ai_up',
      input ? { uses_ai_years: clamp(input.uses_ai_years + 2, 0, TOOL_049_LIMITS.usesAiYearsMax) } : {},
    ),
    runProbe(
      'box5_resistance_up',
      input ? { weekly_resistance_sessions: clamp(input.weekly_resistance_sessions + 2, 0, TOOL_049_LIMITS.weeklyResistanceMax) } : {},
    ),
    runProbe(
      'box5_calcium_up',
      input ? { calcium_mg_daily: clamp(input.calcium_mg_daily + 500, 0, TOOL_049_LIMITS.calciumMgMax) } : {},
    ),
    runProbe(
      'box5_vitd_up',
      input ? { vitamin_d_iu_daily: clamp(input.vitamin_d_iu_daily + 1000, 0, TOOL_049_LIMITS.vitaminDMax) } : {},
    ),
    runProbe('box5_smoking_toggle', input ? { smoker: !input.smoker } : {}),
  ];

  const anyFlip = probes.some((probe) => probe.changed);

  const probeSummary = (probe: Probe, changedKey: string, unchangedKey: string): string => {
    if (probe.error || probe.score === null || probe.band === null || !result) {
      return t.box5_out_of_range;
    }
    const base = `${t.kpi_score}: ${formatScore(result.bone_health_score)} → ${formatScore(probe.score)} · ${t.kpi_band}: ${t[bandLabelKey(result.band)]} → ${t[bandLabelKey(probe.band)]}`;
    return probe.changed ? `${base} · ${t[changedKey]}` : `${base} · ${t[unchangedKey]}`;
  };

  /* ── C1 / Primary result ───────────────────────────────────────────────── */

  const renderPrimaryResult = (): React.ReactNode => (
    <div data-r6-core="c1" className="space-y-2 text-sm">
      {result ? (
        <>
          <p className="font-mono text-2xl font-black text-zinc-100">
            {formatScore(result.bone_health_score)}{' '}
            <span className="text-sm font-bold text-zinc-400">{t.primary_score_suffix}</span>
          </p>
          <p className="text-xs font-bold text-lime-300">
            {t.kpi_band}: {t[bandLabelKey(result.band)]}
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.kpi_risk_factors}:{' '}
            <span className="font-mono font-bold text-zinc-100">{result.risk_factors.length}</span>
            {' · '}
            {t.kpi_interventions}:{' '}
            <span className="font-mono font-bold text-zinc-100">{result.interventions.length}</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            {t.confidence}: <span className="font-bold">{t.confidence_not_assessed}</span>
          </p>
          <p className="text-[11px] text-zinc-500">{t.primary_heuristic_note}</p>
          <p className="text-[11px] text-amber-300">{t.primary_not_dxa_note}</p>
          <p className="text-[11px] text-zinc-500">{t.not_a_prescription}</p>
        </>
      ) : (
        <p className="text-xs text-zinc-400">
          {t.state_waiting} — {t.state_no_result}
        </p>
      )}
    </div>
  );

  /* ── C2 / How calculated ───────────────────────────────────────────────── */

  const contributions = input ? scoreContributions(input) : [];
  const contributionSum = contributions.reduce((sum, item) => sum + item.points, 0);
  const mirrored = input ? mirroredScore(input) : null;

  const renderHowCalculated = (): React.ReactNode => (
    <div data-r6-core="c2" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.formula_title}
        </p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_base}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_resistance}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_calcium}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_vitd}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_ai}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_smoking}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_postmenopausal}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_advanced_age}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.formula_clamp}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.contributions_title}
        </p>
        {contributions.length === 0 ? (
          <p className="mt-1 text-[11px] text-zinc-400">{t.box4_waiting}</p>
        ) : (
          <>
            <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-zinc-300">
              {contributions.map((item) => (
                <li key={item.code}>
                  {t[item.labelKey] ?? item.labelKey}: {formatScore(item.points)} {t.unit_points}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-zinc-400">
              {t.contributions_total}: {formatScore(contributionSum)} {t.unit_points}
              {result && mirrored !== null ? ` → ${formatScore(mirrored)}` : ''}
            </p>
          </>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.inputs_used}
        </p>
        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-zinc-300">
          <li>{t.field_age}: {draft.age.trim() === '' ? t.box4_not_entered : draft.age}</li>
          <li>{t.field_sex}: {draft.sex === '' ? t.not_answered : draft.sex === 'male' ? t.sex_male : t.sex_female}</li>
          <li>{t.field_uses_ai_years}: {draft.usesAiYears.trim() === '' ? t.box4_not_entered : draft.usesAiYears}</li>
          <li>{t.field_weekly_resistance}: {draft.weeklyResistance.trim() === '' ? t.box4_not_entered : draft.weeklyResistance}</li>
          <li>{t.field_calcium}: {draft.calciumMg.trim() === '' ? t.box4_not_entered : `${draft.calciumMg} mg`}</li>
          <li>{t.field_vitamin_d}: {draft.vitaminD.trim() === '' ? t.box4_not_entered : `${draft.vitaminD} IU`}</li>
          <li>{t.field_smoker}: {draft.smoker === '' ? t.not_answered : draft.smoker === 'yes' ? t.yes : t.no}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.assumptions_title}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.assumptions_body}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.uncertainty_title}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.uncertainty_body}</p>
      </div>
    </div>
  );

  /* ── Box 4 / Inputs summary ────────────────────────────────────────────── */

  const renderInputsSummary = (): React.ReactNode => (
    <div data-r6-core="inputs" className="space-y-2 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
        {t.box4_inputs_label}
      </p>
      <ul className="space-y-0.5 font-mono text-[11px] text-zinc-300">
        <li>{t.field_age}: {draft.age.trim() === '' ? t.box4_not_entered : draft.age}</li>
        <li>{t.field_sex}: {draft.sex === '' ? t.not_answered : draft.sex === 'male' ? t.sex_male : t.sex_female}</li>
        <li>{t.field_uses_ai_years}: {draft.usesAiYears.trim() === '' ? t.box4_not_entered : draft.usesAiYears}</li>
        <li>{t.field_weekly_resistance}: {draft.weeklyResistance.trim() === '' ? t.box4_not_entered : draft.weeklyResistance}</li>
        <li>{t.field_calcium}: {draft.calciumMg.trim() === '' ? t.box4_not_entered : `${draft.calciumMg} mg`}</li>
        <li>{t.field_vitamin_d}: {draft.vitaminD.trim() === '' ? t.box4_not_entered : `${draft.vitaminD} IU`}</li>
        <li>{t.field_smoker}: {draft.smoker === '' ? t.not_answered : draft.smoker === 'yes' ? t.yes : t.no}</li>
      </ul>
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
              {probeSummary(probe, 'box5_changed', 'box5_unchanged')}
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
              {probeSummary(probe, 'box6_effect_status', 'box6_effect_no_status')}
            </span>
          </li>
        ))}
      </ul>
      {!anyFlip && <p className="text-[11px] text-amber-300">{t.box6_no_single_change}</p>}
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  /* ── C3 / Risk factors, interventions, warnings ────────────────────────── */

  const renderSafety = (): React.ReactNode => {
    const riskFactors = result?.risk_factors ?? [];
    const interventions = result?.interventions ?? [];
    const warnings = result?.warnings ?? [];
    const redFlags: string[] = [];
    if (warnings.includes('high_fracture_risk_consult_physician')) {
      redFlags.push(t.red_flag_fracture);
    }
    if (riskFactors.includes('smoking')) redFlags.push(t.red_flag_smoking);
    if (riskFactors.includes('ai_exposure')) redFlags.push(t.red_flag_ai);

    return (
      <div data-r6-core="c3" className="space-y-2 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {t.risk_factors_title}
          </p>
          {!result ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.state_waiting}</p>
          ) : riskFactors.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-300">{t.no_risk_factors}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-amber-200">
              {riskFactors.map((code) => (
                <li key={code}>{riskFactorLabel(code)}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {t.interventions_title}
          </p>
          {!result ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.state_waiting}</p>
          ) : interventions.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-300">{t.no_interventions}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-cyan-200">
              {interventions.map((code) => (
                <li key={code}>{interventionLabel(code)}</li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[10px] text-zinc-500">{t.interventions_informational_note}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {t.warnings_title}
          </p>
          {warnings.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-300">
              {result ? t.no_warnings : t.state_waiting}
            </p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-amber-200">
              {warnings.map((code) => (
                <li key={code}>{warningLabel(code)}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {t.red_flags}
          </p>
          {!result ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.state_waiting}</p>
          ) : redFlags.length === 0 ? (
            <p className="mt-1 text-[11px] text-zinc-400">{t.no_red_flags}</p>
          ) : (
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-red-300">
              {redFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {t.referral_title}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400">{t.referral_not_available}</p>
          <p className="mt-1 text-[10px] font-bold uppercase text-amber-400">
            {t.pending_medical_review}
          </p>
        </div>
      </div>
    );
  };

  /* ── Box 8 / Cross-tool ─────────────────────────────────────────────────── */

  const renderCrossTool = (): React.ReactNode => (
    <div data-r6-core="cross-tool" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box8_intro}</p>
      <ul className="space-y-2">
        {TOOL_049_CROSS_TOOL_LINKS.map((link) => {
          const linkTool = requireTool(link.targetToolId);
          const keys = CROSS_TOOL_KEYS[link.targetToolId];
          return (
            <li
              key={link.targetToolId}
              className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]"
            >
              <p className="font-bold text-zinc-200">
                {isAr ? linkTool.titleAr : linkTool.titleEn}
              </p>
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
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.box8_prev_next}
        </p>
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
      <p className="text-[11px] text-zinc-500">{t.evidence_no_invented_range}</p>
      <p className="text-[10px] font-bold uppercase text-amber-400">{t.pending_medical_review}</p>
      {TOOL_049_SOURCES.length > 0 && (
        <ul className="space-y-1">
          {TOOL_049_SOURCES.map((source) => (
            <li
              key={source.id}
              className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-cyan-300 underline"
              >
                {t[source.titleKey] ?? source.titleKey}
              </a>
              <p className="mt-1 text-zinc-400">
                {t.evidence_publisher}: {source.publisher} · {t.evidence_date}: {source.reviewedOn}{' '}
                · {t.evidence_level}: {source.evidenceLevel}
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
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {t.box12_rating}
        </p>
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
        <span className="block text-[10px] text-zinc-500">{t.kpi_score}</span>
        <span className="font-mono text-sm font-bold text-lime-300">
          {result ? formatScore(result.bone_health_score) : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_band}</span>
        <span className="text-sm font-bold text-zinc-100">
          {result ? t[bandLabelKey(result.band)] : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_risk_factors}</span>
        <span className="font-mono text-sm font-bold text-amber-300">
          {result ? result.risk_factors.length : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_interventions}</span>
        <span className="font-mono text-sm font-bold text-cyan-300">
          {result ? result.interventions.length : '—'}
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
          const csv = buildBoneDensityCsv(input, result, output?.calculatedAt ?? options.calculatedAt);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'tool-049-bone-density.csv';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
      >
        {t.box10_button}
      </button>
      <p className="text-[11px] text-zinc-500">
        {result ? t.box10_note : t.box10_unavailable}
      </p>
    </div>
  );

  const boxes: BoxDefinition[] = [
    { n: 1, id: 'kpi', titleKey: 'box1_title', source: 'engine', content: (<div className="space-y-2 text-sm">{kpi}<p className="text-[11px] text-zinc-500">{t.box1_note}</p></div>) },
    { n: 2, id: 'primary', titleKey: 'box2_title', source: 'engine', content: renderPrimaryResult() },
    { n: 3, id: 'calculated', titleKey: 'box3_title', source: 'static', content: renderHowCalculated() },
    { n: 4, id: 'inputs', titleKey: 'box4_title', source: 'static', content: renderInputsSummary() },
    { n: 5, id: 'what-if', titleKey: 'box5_title', source: 'engine', content: renderWhatIf() },
    { n: 6, id: 'sensitivity', titleKey: 'box6_title', source: 'engine', content: renderSensitivity() },
    { n: 7, id: 'safety', titleKey: 'box7_title', source: 'engine', content: renderSafety() },
    { n: 8, id: 'cross-tool', titleKey: 'box8_title', source: 'static', content: renderCrossTool() },
    { n: 9, id: 'sources', titleKey: 'box9_title', source: 'not_available', content: renderSources() },
    { n: 10, id: 'export', titleKey: 'box10_title', source: 'static', content: renderExport() },
    { n: 11, id: 'history', titleKey: 'box11_title', source: 'not_available', content: <p className="text-xs text-zinc-400">{t.box11_na}</p> },
    { n: 12, id: 'next-actions', titleKey: 'box12_title', source: 'static', content: renderNextActions() },
  ];

  const compactBoxes = [boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]];
  const visibleBoxes = compact ? compactBoxes : boxes;

  return (
    <section
      className="mt-8 space-y-4"
      aria-label={t.genius_section_label}
      data-r6-genius="tool-049"
      data-r6-genius-state={state}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {compact ? t.genius_title_compact : t.genius_title}
        </h2>
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
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
              >
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
