/**
 * lib/tools/r6/tool-049-bone-density-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 049 — Bone Density Optimizer.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (score weights, clamps, band cut-offs, risk-factor and intervention
 * triggers, input bounds) so the interface can explain them, and a sync test
 * proves the repeated values still describe the engine's real behaviour. The
 * engine, schema and adapter are not imported, edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * treatment recommendation. The engine's existing risk factors, interventions
 * and warnings are preserved and only mapped to localisation keys; every
 * clinical sentence that would need new wording is held as `NOT_AVAILABLE`
 * until a specialist approves it. The engine itself is explicitly educational
 * screening, not a DXA diagnosis.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  BoneDensityInputSchema,
  BoneDensityResultSchema,
  type BoneDensityInput,
} from '@/lib/tools/schemas/tool-049-bone-density';

/** The result shape, derived from the canonical schema (no engine import). */
export type BoneDensityResult = ReturnType<typeof BoneDensityResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool049Sex = '' | 'male' | 'female';
export type Tool049Bool = '' | 'yes' | 'no';

export interface Tool049Draft {
  age: string;
  sex: Tool049Sex;
  usesAiYears: string;
  weeklyResistance: string;
  calciumMg: string;
  vitaminD: string;
  smoker: Tool049Bool;
}

export type Tool049UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool049FieldId =
  | 'age'
  | 'sex'
  | 'usesAiYears'
  | 'weeklyResistance'
  | 'calciumMg'
  | 'vitaminD'
  | 'smoker';

export type Tool049IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool049Issue {
  field: Tool049FieldId;
  code: Tool049IssueCode;
}

export interface Tool049Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool049Issue[];
  input: BoneDensityInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_049_LIMITS = {
  /** Input contract bounds. */
  ageMin: 18,
  ageMax: 90,
  usesAiYearsMin: 0,
  usesAiYearsMax: 30,
  weeklyResistanceMin: 0,
  weeklyResistanceMax: 14,
  calciumMgMin: 0,
  calciumMgMax: 3000,
  vitaminDMin: 0,
  vitaminDMax: 10000,
  /** Engine score weights and clamps. */
  baseScore: 60,
  resistanceCap: 20,
  resistancePerSession: 3,
  calciumCap: 15,
  calciumDivisor: 100,
  vitaminDCap: 15,
  vitaminDDivisor: 400,
  aiPenaltyPerYear: 2.5,
  smokerPenalty: 8,
  postmenopausalPenalty: 8,
  advancedAgePenalty: 5,
  advancedAgeAbove: 65,
  postmenopausalAgeAbove: 50,
  scoreFloor: 0,
  scoreCeiling: 100,
  /** Engine band cut-offs: >=80 optimal, >=60 good, >=40 at-risk, else high-risk. */
  bandOptimalAtLeast: 80,
  bandGoodAtLeast: 60,
  bandAtRiskAtLeast: 40,
  /** Engine risk-factor thresholds. */
  resistanceTrainingLowBelow: 2,
  resistanceProgramBelow: 3,
  calciumLowBelow: 800,
  calciumIntakeBelow: 1000,
  vitaminDLowBelow: 800,
  vitaminDIntakeBelow: 1000,
  /** Engine intervention trigger. */
  dxaScanBelowScore: 80,
  /** Engine warning trigger. */
  highFractureBelowScore: 40,
  /** The engine's canonical unit. */
  unit: 'score',
} as const;

/* ── Label maps (the engine emits codes, never display text) ───────────────── */

const BAND_KEYS: Record<string, string> = {
  optimal: 'band_optimal',
  good: 'band_good',
  'at-risk': 'band_at_risk',
  'high-risk': 'band_high_risk',
};

export function bandLabelKey(band: string): string {
  return BAND_KEYS[band] ?? 'band_unknown';
}

const RISK_FACTOR_KEYS: Record<string, string> = {
  ai_exposure: 'rf_ai_exposure',
  low_resistance_training: 'rf_low_resistance',
  low_calcium: 'rf_low_calcium',
  low_vitamin_d: 'rf_low_vitamin_d',
  smoking: 'rf_smoking',
  postmenopausal_proxy: 'rf_postmenopausal',
  advanced_age: 'rf_advanced_age',
};

export function riskFactorLabelKey(code: string): string {
  return RISK_FACTOR_KEYS[code] ?? 'rf_unknown';
}

const INTERVENTION_KEYS: Record<string, string> = {
  review_ai_use_with_physician: 'iv_review_ai',
  progressive_resistance_program: 'iv_resistance_program',
  calcium_intake_1000mg: 'iv_calcium',
  vitamin_d_1000_2000iu: 'iv_vitamin_d',
  smoking_cessation: 'iv_smoking_cessation',
  dxa_scan_discussion: 'iv_dxa',
};

export function interventionLabelKey(code: string): string {
  return INTERVENTION_KEYS[code] ?? 'iv_unknown';
}

const WARNING_KEYS: Record<string, string> = {
  educational_screening_not_diagnosis: 'warning_educational',
  high_fracture_risk_consult_physician: 'warning_fracture',
};

export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/* ── Mirrored arithmetic, used only to EXPLAIN the engine result ───────────── */

export interface Tool049Contribution {
  code: string;
  labelKey: string;
  points: number;
}

export function scoreContributions(input: BoneDensityInput): Tool049Contribution[] {
  return [
    { code: 'base', labelKey: 'contribution_base', points: TOOL_049_LIMITS.baseScore },
    {
      code: 'resistance',
      labelKey: 'contribution_resistance',
      points: Math.min(
        TOOL_049_LIMITS.resistanceCap,
        input.weekly_resistance_sessions * TOOL_049_LIMITS.resistancePerSession,
      ),
    },
    {
      code: 'calcium',
      labelKey: 'contribution_calcium',
      points: Math.min(
        TOOL_049_LIMITS.calciumCap,
        input.calcium_mg_daily / TOOL_049_LIMITS.calciumDivisor,
      ),
    },
    {
      code: 'vitamin_d',
      labelKey: 'contribution_vitamin_d',
      points: Math.min(
        TOOL_049_LIMITS.vitaminDCap,
        input.vitamin_d_iu_daily / TOOL_049_LIMITS.vitaminDDivisor,
      ),
    },
    {
      code: 'ai',
      labelKey: 'contribution_ai',
      points: -input.uses_ai_years * TOOL_049_LIMITS.aiPenaltyPerYear,
    },
    {
      code: 'smoking',
      labelKey: 'contribution_smoking',
      points: input.smoker ? -TOOL_049_LIMITS.smokerPenalty : 0,
    },
    {
      code: 'postmenopausal',
      labelKey: 'contribution_postmenopausal',
      points:
        input.age > TOOL_049_LIMITS.postmenopausalAgeAbove && input.sex === 'female'
          ? -TOOL_049_LIMITS.postmenopausalPenalty
          : 0,
    },
    {
      code: 'advanced_age',
      labelKey: 'contribution_advanced_age',
      points: input.age > TOOL_049_LIMITS.advancedAgeAbove ? -TOOL_049_LIMITS.advancedAgePenalty : 0,
    },
  ];
}

export function mirroredScore(input: BoneDensityInput): number {
  const raw = scoreContributions(input).reduce((sum, item) => sum + item.points, 0);
  const clamped = Math.min(TOOL_049_LIMITS.scoreCeiling, Math.max(TOOL_049_LIMITS.scoreFloor, raw));
  return Math.round(clamped);
}

export function mirroredRiskFactors(input: BoneDensityInput): string[] {
  const factors: string[] = [];
  if (input.uses_ai_years > 0) factors.push('ai_exposure');
  if (input.weekly_resistance_sessions < TOOL_049_LIMITS.resistanceTrainingLowBelow) {
    factors.push('low_resistance_training');
  }
  if (input.calcium_mg_daily < TOOL_049_LIMITS.calciumLowBelow) factors.push('low_calcium');
  if (input.vitamin_d_iu_daily < TOOL_049_LIMITS.vitaminDLowBelow) factors.push('low_vitamin_d');
  if (input.smoker) factors.push('smoking');
  if (input.age > TOOL_049_LIMITS.postmenopausalAgeAbove && input.sex === 'female') {
    factors.push('postmenopausal_proxy');
  }
  if (input.age > TOOL_049_LIMITS.advancedAgeAbove) factors.push('advanced_age');
  return factors;
}

export function mirroredInterventions(input: BoneDensityInput, score: number): string[] {
  const items: string[] = [];
  if (input.uses_ai_years > 0) items.push('review_ai_use_with_physician');
  if (input.weekly_resistance_sessions < TOOL_049_LIMITS.resistanceProgramBelow) {
    items.push('progressive_resistance_program');
  }
  if (input.calcium_mg_daily < TOOL_049_LIMITS.calciumIntakeBelow) items.push('calcium_intake_1000mg');
  if (input.vitamin_d_iu_daily < TOOL_049_LIMITS.vitaminDIntakeBelow) {
    items.push('vitamin_d_1000_2000iu');
  }
  if (input.smoker) items.push('smoking_cessation');
  if (score < TOOL_049_LIMITS.dxaScanBelowScore) items.push('dxa_scan_discussion');
  return items;
}

export function mirroredWarnings(score: number): string[] {
  const warnings: string[] = ['educational_screening_not_diagnosis'];
  if (score < TOOL_049_LIMITS.highFractureBelowScore) {
    warnings.push('high_fracture_risk_consult_physician');
  }
  return warnings;
}

export function bandForScore(score: number): string {
  if (score >= TOOL_049_LIMITS.bandOptimalAtLeast) return 'optimal';
  if (score >= TOOL_049_LIMITS.bandGoodAtLeast) return 'good';
  if (score >= TOOL_049_LIMITS.bandAtRiskAtLeast) return 'at-risk';
  return 'high-risk';
}

export function formatScore(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ── Draft evaluation (the five-state model) ───────────────────────────────── */

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function rangeIssue(
  text: string,
  field: Tool049FieldId,
  min: number,
  max: number,
  issues: Tool049Issue[],
): number | null {
  if (text.trim() === '') return null;
  const value = numeric(text);
  if (value === null) {
    issues.push({ field, code: 'invalid_number' });
    return null;
  }
  if (value < min || value > max) {
    issues.push({ field, code: 'out_of_range' });
    return null;
  }
  return value;
}

export function evaluateBoneDensityDraft(draft: Tool049Draft): Tool049Evaluation {
  const issues: Tool049Issue[] = [];

  const age = rangeIssue(draft.age, 'age', TOOL_049_LIMITS.ageMin, TOOL_049_LIMITS.ageMax, issues);
  const usesAiYears = rangeIssue(
    draft.usesAiYears,
    'usesAiYears',
    TOOL_049_LIMITS.usesAiYearsMin,
    TOOL_049_LIMITS.usesAiYearsMax,
    issues,
  );
  const weeklyResistance = rangeIssue(
    draft.weeklyResistance,
    'weeklyResistance',
    TOOL_049_LIMITS.weeklyResistanceMin,
    TOOL_049_LIMITS.weeklyResistanceMax,
    issues,
  );
  const calciumMg = rangeIssue(
    draft.calciumMg,
    'calciumMg',
    TOOL_049_LIMITS.calciumMgMin,
    TOOL_049_LIMITS.calciumMgMax,
    issues,
  );
  const vitaminD = rangeIssue(
    draft.vitaminD,
    'vitaminD',
    TOOL_049_LIMITS.vitaminDMin,
    TOOL_049_LIMITS.vitaminDMax,
    issues,
  );

  if (draft.sex !== '' && draft.sex !== 'male' && draft.sex !== 'female') {
    issues.push({ field: 'sex', code: 'out_of_range' });
  }
  if (draft.smoker !== '' && draft.smoker !== 'yes' && draft.smoker !== 'no') {
    issues.push({ field: 'smoker', code: 'out_of_range' });
  }

  const anyEntered =
    draft.age.trim() !== '' ||
    draft.sex !== '' ||
    draft.usesAiYears.trim() !== '' ||
    draft.weeklyResistance.trim() !== '' ||
    draft.calciumMg.trim() !== '' ||
    draft.vitaminD.trim() !== '' ||
    draft.smoker !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    age !== null &&
    draft.sex !== '' &&
    usesAiYears !== null &&
    weeklyResistance !== null &&
    calciumMg !== null &&
    vitaminD !== null &&
    draft.smoker !== '';

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: BoneDensityInput = {
    age: age as number,
    sex: draft.sex as 'male' | 'female',
    uses_ai_years: usesAiYears as number,
    weekly_resistance_sessions: weeklyResistance as number,
    calcium_mg_daily: calciumMg as number,
    vitamin_d_iu_daily: vitaminD as number,
    smoker: draft.smoker === 'yes',
  };

  const parsed = BoneDensityInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'age', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool049SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_049_SOURCES: readonly Tool049SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool049MappedField {
  targetField: string;
  note: string;
}

export interface Tool049CrossToolLink {
  targetToolId: string;
  mappedFields: Tool049MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_049_CROSS_TOOL_LINKS: readonly Tool049CrossToolLink[] = [
  {
    targetToolId: 'tool-047-fertility-preservation',
    mappedFields: [
      {
        targetField: 'ai_exposure_years',
        note: 're-enter the aromatase-inhibitor exposure years by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-046-trt-lifetime',
    mappedFields: [
      {
        targetField: 'monitoring_context',
        note: 're-enter the monitoring cost and protocol start date by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildBoneDensityCsv(
  input: BoneDensityInput,
  result: BoneDensityResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-049-bone-density'],
    ['calculated_at', calculatedAt],
    [],
    ['age', String(input.age)],
    ['sex', input.sex],
    ['uses_ai_years', String(input.uses_ai_years)],
    ['weekly_resistance_sessions', String(input.weekly_resistance_sessions)],
    ['calcium_mg_daily', String(input.calcium_mg_daily)],
    ['vitamin_d_iu_daily', String(input.vitamin_d_iu_daily)],
    ['smoker', String(input.smoker)],
    [],
    ['bone_health_score', String(result.bone_health_score)],
    ['band', result.band],
    ['risk_factors', result.risk_factors.join('|')],
    ['interventions', result.interventions.join('|')],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
